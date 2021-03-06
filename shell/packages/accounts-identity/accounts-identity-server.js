// Sandstorm - Personal Cloud Sandbox
// Copyright (c) 2015 Sandstorm Development Group, Inc. and contributors
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Meteor.methods({
  loginWithIdentity: function (accountUserId) {
    // Logs into the account with ID `accountUserId`. Throws an exception if the current user is
    // not an identity user listed in the account's `loginIdentities` field. This method is not
    // intended to be called directly; client-side code should only invoke it through
    // `Meteor.loginWithIdentity()`, which additionally maintains the standard Meteor client-side
    // login state.

    check(accountUserId, String);

    var identityUser = Meteor.user();
    if (!identityUser) {
      throw new Meteor.Error(403, "Must be already logged in to used linked user login.");
    }

    var accountUser = Meteor.users.findOne(accountUserId);
    if (!accountUser) {
      throw new Meteor.Error(404, "No such user found: " + accountUserId);
    }

    var linkedIdentity = _.findWhere(accountUser.loginIdentities, {id: identityUser._id});

    if (!linkedIdentity) {
      throw new Meteor.Error(403, "Current identity is not a login identity for account "
                             + accountUserId);
    }

    return Accounts._loginMethod(this, "loginWithIdentity", [accountUserId],
                                 "identity", function () { return { userId: accountUserId }; });
  },

  getLoginAccountOfIdentity: function() {
    // Attempts to find an account that has the current user as a login identity. If the identity
    // is not linked to any account, creates a new account for it. Returns a value of type
    // `OneOf({alreadyAccount: null},
    //        {loginAccountId: String},
    //        {nonloginAccounts: [{accountId: String, loginIdentityUser: User}]})`
    // where the nonloginAccounts variant indicates that this identity cannot log in to any existing
    // account, and the corresponding list has information about the accounts that this identity is
    // linked to. The alreadyAccount variant is not an error because the client is allowed to call
    // this method before its accountIdentities subscription is ready, and therefore it might
    // not yet know whether the user is an identity or an account.

    var user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(403, "Must be logged in to look up accounts.")
    }
    if (user.loginIdentities) return {alreadyAccount: null};

    var loginAccount = Meteor.users.findOne({"loginIdentities.id": user._id},
                                            {fields: {_id: 1, "loginIdentities.$": 1}});

    if (loginAccount) {
      return {loginAccountId: loginAccount._id};
    }

    var nonloginAccounts = Meteor.users.find({"nonloginIdentities.id": user._id}).fetch();

    var accountUserId;
    if (nonloginAccounts.length == 0) {
      // Make a new account for this user.
      var newUser = {loginIdentities: [{id: user._id}],
                     nonloginIdentities: []};
      if (user.services.dev) {
        newUser.signupKey = "devAccounts";
        if (user.services.dev.isAdmin) {
          newUser.isAdmin = true;
        }
        if (user.services.dev.hasCompletedSignup) {
          newUser.hasCompletedSignup = true;
        }
      } else if (user.expires) {
        // Demo user.
        newUser.expires = user.expires;
      }
      var options = {};
      accountUserId = Accounts.insertUserDoc(options, newUser);
      return {loginAccountId: accountUserId};
    } else {
      var resultData = [];
      nonloginAccounts.forEach(function(account) {
        if (account.loginIdentities.length > 0) {
          for (var jj = 0; jj < account.loginIdentities.length; ++jj) {
            var loginIdentityUser =
                Meteor.users.findOne({_id: account.loginIdentities[jj].id});
            if (loginIdentityUser) {
              var userWithDefaults = SandstormDb.getUserIdentities(loginIdentityUser)[0];
              resultData.push({accountId: account._id,
                               loginIdentityUser: _.pick(userWithDefaults, "_id", "profile")});
            }
          }
        }
      });
      return {nonloginAccounts: resultData};
    }
  },

  linkIdentityToAccount: function(token) {
    // Links the identity of the current user to the account that has `token` as a resume token.
    // If the account is a demo account, attempts to gives the identity login access to the account.

    check(token, String);

    if (!this.userId) {
      throw new Meteor.Error(403, "Cannot link to account if not logged in.");
    }
    var hashed = Accounts._hashLoginToken(token);
    var accountUser = Meteor.users.findOne({"services.resume.loginTokens.hashedToken": hashed});

    if (!accountUser) {
      throw new Meteor.Error(404, "No account found for token: " + token);
    }

    if (accountUser.profile) {
      throw new Meteor.Error(400, "Cannot link an identity to another identity.");
    }

    var identityUser = Meteor.user();

    if (!identityUser.profile) {
      throw new Meteor.Error(400, "Current user is not an identity user.");
    }

    var modifier;
    if (accountUser.expires) {
      if (Meteor.users.findOne({"loginIdentities.id": identityUser._id})) {
        throw new Meteor.Error(403, "Cannot upgrade demo account with an identity that can " +
                               "already be used for login on another account.");
      }

      modifier = {$push: {loginIdentities: {id: identityUser._id}},
                  $unset: {expires: 1},
                  $set: {upgradedFromDemo: Date.now()}};
    } else {
      modifier = {$push: {nonloginIdentities: {id: identityUser._id}}};
    }

    // Make sure not to add the same identity twice.
    Meteor.users.update({_id: accountUser._id, "nonloginIdentities.id": {$ne: identityUser._id},
                        "loginIdentities.id": {$ne: identityUser._id}},
                        modifier);

    if (accountUser.expires) {
      Meteor.users.update({_id: accountUser.loginIdentities[0].id},
                          {$unset: {expires: 1},
                           $set: {upgradedFromDemo: Date.now()}});
    }
  },

  unlinkIdentity: function (accountUserId, identityId) {
    // Unlinks the identity with ID `identityId` from the account with ID `accountUserId`.

    check(identityId, String);
    check(accountUserId, String);

    if (!this.userId) {
      throw new Meteor.Error(403, "Not logged in.");
    }
    if (!this.connection.sandstormDb.userHasIdentity(accountUserId, identityId)) {
      throw new Meteor.Error(403, "Current user does not own identity " + identityId);
    }

    var identityUser = Meteor.users.findOne({_id: identityId});
    if (this.userId === accountUserId || this.userId === identityUser._id) {
      Meteor.users.update({_id: accountUserId},
                          {$pull: {nonloginIdentities: {id: identityId},
                                   loginIdentities: {id: identityId}}});
    } else {
      throw new Meteor.Error(403, "Not authorized to unlink identity " + identityId);
    }
  },

  setIdentityAllowsLogin: function(identityId, allowLogin) {
    // Sets whether the current account allows the identity with ID `identityId` to log in.

    check(identityId, String);
    check(allowLogin, Boolean);
    if (!this.userId) {
      throw new Meteor.Error(403, "Not logged in.");
    }
    if (!this.connection.sandstormDb.userHasIdentity(this.userId, identityId)) {
      throw new Meteor.Error(403, "Current user does not own identity " + identityId);
    }

    if (allowLogin) {
      Meteor.users.update({_id: this.userId,
                           "nonloginIdentities.id": identityId,
                           "loginIdentities.id": {$not: {$eq: identityId}}},
                          {$pull: {nonloginIdentities: {id: identityId}},
                           $push: {loginIdentities: {id: identityId}}});
    } else {
      Meteor.users.update({_id: this.userId,
                           "loginIdentities.id": identityId,
                           "nonloginIdentities.id": {$not: {$eq: identityId}}},
                          {$pull: {loginIdentities: {id: identityId}},
                           $push: {nonloginIdentities: {id: identityId}}});
    }
  },

  logoutIdentitiesOfCurrentAccount: function() {
    // Logs out all identities that are allowed to log in to the current account.
    var user = Meteor.user();
    if (user && user.loginIdentities) {
      user.loginIdentities.forEach(function(identity) {
        Meteor.users.update({_id: identity.id}, {$set: {"services.resume.loginTokens": []}});
      });
    }
  }
});

Accounts.linkIdentityToAccount = function (identityId, accountId) {
  // Links the identity to the account.

  check(identityId, String);
  check(accountId, String);

  // Make sure not to add the same identity twice.
  Meteor.users.update({_id: accountId,
                       loginIdentities: {$exists: true},
                       "nonloginIdentities.id": {$ne: identityId},
                       "loginIdentities.id": {$ne: identityId}},
                      {$push: {"nonloginIdentities": {id: identityId}}});

}
