// Sandstorm - Personal Cloud Sandbox
// Copyright (c) 2014 Sandstorm Development Group, Inc. and contributors
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

'use strict';

var utils = require('../utils'),
    appDetailsTitleSelector = utils.appDetailsTitleSelector,
    actionSelector = utils.actionSelector,
    short_wait = utils.short_wait,
    medium_wait = utils.medium_wait,
    long_wait = utils.long_wait,
    very_long_wait = utils.very_long_wait;
var path = require('path');
var assetsPath = path.resolve(__dirname, '../assets');
var expectedHackerCMSButtonText = 'New Hacker CMS site';
var expectedHackerCMSGrainTitle = 'Untitled Hacker CMS site';
var expectedEtherpadGrainTitle = 'Untitled Etherpad document';

module.exports = utils.testAllLogins({
  // TODO(soon): Uploading tests are broken. Waiting on refactor of upload input to fix.
  // "Test local install" : function (browser) {
  //   browser
  //     .click('#upload-app-button')
  //     .ifDemo(function () {
  //       browser
  //         .waitForElementVisible('.upload-button', medium_wait)
  //         .assert.containsText('#uploadButton', 'Upload')
  //         .waitForElementVisible('#uploadButton', short_wait)
  //         .setValue('#uploadFile', path.join(assetsPath, 'ssjekyll6.spk'))
  //         .click('#uploadButton')
  //         // .waitForElementVisible('#upload p', medium_wait)
  //         // .assert.containsText('#upload p', 'Sorry, this server requires an invite before you can install apps.')
  //         .init()
  //         .waitForElementVisible('#applist-apps', medium_wait);
  //     })
  //     .ifNotDemo(function () {
  //       browser
  //         .waitForElementVisible('#uploadButton', medium_wait)
  //         .assert.containsText('#uploadButton', 'Upload')
  //         .waitForElementVisible('#uploadButton', short_wait)
  //         .setValue('#uploadFile', path.join(assetsPath, 'ssjekyll6.spk'))
  //         .click('#uploadButton')
  //         .waitForElementVisible('#step-confirm', long_wait)
  //         .click('#confirmInstall')
  //         .waitForElementVisible('.new-grain-button', short_wait)
  //         .assert.containsText('.new-grain-button', expectedHackerCMSButtonText);
  //     });
  // },

  // "Test upgrade" : function (browser) {
  //   browser
  //     .click("#applist-apps > ul > li:nth-child(1)")
  //     .waitForElementVisible('#upload-app-button', medium_wait)
  //     .click('#upload-app-button')
  //     .ifDemo(function () {
  //       browser
  //         .waitForElementVisible('#upload p', medium_wait)
  //         // .assert.containsText('#upload p', 'demo users are not allowed')
  //         .init()
  //         .waitForElementVisible('#applist-apps', medium_wait);
  //     })
  //     .ifNotDemo(function () {
  //       browser
  //         .waitForElementVisible('#uploadButton', medium_wait)
  //         .assert.containsText('#uploadButton', 'Upload')
  //         .waitForElementVisible('#uploadButton', short_wait)
  //         .setValue('#uploadFile', path.join(assetsPath, 'ssjekyll7.spk'))
  //         .click('#uploadButton')
  //         .waitForElementVisible('#step-confirm', long_wait)
  //         .assert.containsText('#confirmInstall', 'Upgrade')
  //         .click('#confirmInstall')
  //         .waitForElementVisible('.new-grain-button', short_wait)
  //         .assert.containsText('.new-grain-button', expectedHackerCMSButtonText);
  //     });
  // },

  // "Test downgrade" : function (browser) {
  //   browser
  //     .click("#applist-apps > ul > li:nth-child(1)")
  //     .waitForElementVisible('#upload-app-button', medium_wait)
  //     .click('#upload-app-button')
  //     .ifDemo(function () {
  //       browser
  //         .waitForElementVisible('#upload p', medium_wait)
  //         // .assert.containsText('#upload p', 'demo users are not allowed')
  //         .init()
  //         .waitForElementVisible('#applist-apps', medium_wait);
  //     })
  //     .ifNotDemo(function () {
  //       browser
  //         .waitForElementVisible('#uploadButton', medium_wait)
  //         .assert.containsText('#uploadButton', 'Upload')
  //         .waitForElementVisible('#uploadButton', short_wait)
  //         .setValue('#uploadFile', path.join(assetsPath, 'ssjekyll5.spk'))
  //         .click('#uploadButton')
  //         .waitForElementVisible('#step-confirm', long_wait)
  //         .assert.containsText('#confirmInstall', 'Downgrade')
  //         .click('#confirmInstall')
  //         .waitForElementVisible('.new-grain-button', short_wait)
  //         .assert.containsText('.new-grain-button', expectedHackerCMSButtonText);
  //     });
  // },

  "Test remote install" : function (browser) {
    browser
      .url(browser.launch_url + "/install/ca690ad886bf920026f8b876c19539c1?url=http://sandstorm.io/apps/ssjekyll8.spk")
      .waitForElementVisible('#step-confirm', very_long_wait)
      .click('#confirmInstall')
      .waitForElementVisible(appDetailsTitleSelector, short_wait)
      .assert.containsText(appDetailsTitleSelector, 'Hacker CMS')
  },

  "Test new grain" : function (browser) {
    browser
      .waitForElementVisible(actionSelector, short_wait)
      .click(actionSelector)
      .waitForElementVisible('#grainTitle', medium_wait)
      .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle);
  },

  "Test grain frame" : function (browser) {
    browser
      .pause(short_wait)
      .frame('grain-frame')
      .waitForElementPresent('#publish', medium_wait)
      .assert.containsText('#publish', 'Publish')
      .frame(null);
  },

  "Test grain download" : function (browser) {
    browser
      .click('#backupGrain');
      // TODO(someday): detect if error occurred, since there's no way for selenium to verify downloads
  },

  "Test grain restart" : function (browser) {
    browser
      .click('#restartGrain')
      .pause(short_wait)
      .frame('grain-frame')
      .waitForElementPresent('#publish', medium_wait)
      .pause(short_wait)
      .assert.containsText('#publish', 'Publish')
      .frame(null);
  },

  "Test grain debug" : function (browser) {
    browser
      .click('#openDebugLog')
      .pause(short_wait)
      .windowHandles(function (windows) {
        browser.switchWindow(windows.value[1]);
      })
      .pause(short_wait)
      .assert.containsText('.grainlog-title', 'Debug log: ' + expectedHackerCMSGrainTitle)
      .closeWindow()
      .end();
  },
});

module.exports["Test grain anonymous user"] = function (browser) {
  browser
    // Upload app as normal user
    .installApp("http://sandstorm.io/apps/ssjekyll8.spk", "ca690ad886bf920026f8b876c19539c1", "nqmcqs9spcdpmqyuxemf0tsgwn8awfvswc58wgk375g4u25xv6yh")
    .waitForElementVisible('#grainTitle', medium_wait)
    .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
    .click('.topbar .share > .show-popup')
    .waitForElementVisible('#shareable-link-tab-header', short_wait)
    .click('#shareable-link-tab-header')
    .waitForElementVisible(".new-share-token", short_wait)
    .submitForm('.new-share-token')
    .waitForElementVisible('#share-token-text', medium_wait)
    // Navigate to the url with an anonymous user
    .getText('#share-token-text', function(response) {
      browser
        .execute('window.Meteor.logout()')
        .pause(short_wait)
        .url(response.value)
        .waitForElementVisible('#grainTitle', medium_wait)
        .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
        .frame('grain-frame')
        .waitForElementPresent('#publish', medium_wait)
        .assert.containsText('#publish', 'Publish')
        .frame(null)
    });
}

// Test roleless sharing between multiple users
module.exports["Test roleless sharing"] = function (browser) {
  var firstUserName;
  var secondUserName;
  browser
  // Upload app as 1st user
    .loginDevAccount()
    .execute(function () { return SandstormDb.getUserIdentities(Meteor.user())[0].profile.intrinsicName; }, [], function(result) {
      firstUserName = result.value;
    })
    .url(browser.launch_url + "/install/ca690ad886bf920026f8b876c19539c1?url=http://sandstorm.io/apps/ssjekyll8.spk")
    .waitForElementVisible('#step-confirm', very_long_wait)
    .click('#confirmInstall')
    .waitForElementVisible(appDetailsTitleSelector, short_wait)
    .assert.containsText(appDetailsTitleSelector, 'Hacker CMS')
    // Create grain with that user
    .waitForElementVisible(actionSelector, short_wait)
    .click(actionSelector)
    .waitForElementVisible('.grain-frame', medium_wait)
    .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
    .click('.topbar .share > .show-popup')
    .waitForElementVisible("#shareable-link-tab-header", short_wait)
    .click("#shareable-link-tab-header")
    .waitForElementVisible(".new-share-token", short_wait)
    .submitForm('.new-share-token')
    .waitForElementVisible('#share-token-text', medium_wait)
    // Navigate to the url with 2nd user
    .getText('#share-token-text', function(response) {
      browser
        .loginDevAccount()
        .execute(function () { return SandstormDb.getUserIdentities(Meteor.user())[0].profile.intrinsicName; }, [], function(result) {
          secondUserName = result.value;
        })
        .url(response.value)
        .waitForElementVisible("button.pick-identity", short_wait)
        .click("button.pick-identity")
        .waitForElementVisible('.grain-frame', medium_wait)
        .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
        .frame('grain-frame')
        .waitForElementPresent('#publish', medium_wait)
        .assert.containsText('#publish', 'Publish')
        .frame(null)
        .click('.topbar .share > .show-popup')
        .waitForElementVisible("#shareable-link-tab-header", short_wait)
        .click("#shareable-link-tab-header")
        .waitForElementVisible(".new-share-token", short_wait)
        .submitForm('.new-share-token')
        .waitForElementVisible('#share-token-text', medium_wait)
        // Navigate to the re-shared url with 3rd user
        .getText('#share-token-text', function(response) {
          browser
            .loginDevAccount()
            .url(response.value)
            .waitForElementVisible("button.pick-identity", short_wait)
            .click("button.pick-identity")
            .waitForElementVisible('.grain-frame', medium_wait)
            .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
            .frame('grain-frame')
            .waitForElementPresent('#publish', medium_wait)
            .assert.containsText('#publish', 'Publish')
            .frame(null)
            .click('.topbar .share > .show-popup')
            .waitForElementVisible("#shareable-link-tab-header", short_wait)
            .click("#shareable-link-tab-header")
            .waitForElementVisible(".new-share-token", short_wait)
            .submitForm('.new-share-token')
            .waitForElementVisible('#share-token-text', medium_wait)

            .loginDevAccount(firstUserName)
            .url(response.value)
            .waitForElementVisible("button.pick-identity", short_wait)
            .click("button.pick-identity")
            .waitForElementVisible('.grain-frame', medium_wait)
            .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
            .click('.topbar .share > .show-popup')
            .click('.popup.share .who-has-access')
            .waitForElementVisible('.popup.who-has-access', medium_wait)
            .assert.containsText('.popup.who-has-access .people td', secondUserName)
        });
    });
}

// Test sharing between multiple users. The users here are different from those in the
// "Test roleless sharing" case to ensure that the incognito interstitial always appears.
// TODO(soon): this test is failing intermittently. It seems to be a bug in etherpad? Re-write test using a different app.
module.exports["Test role sharing"] = function (browser) {
  browser
    // Upload app as 1st user
    .loginDevAccount()
    .url(browser.launch_url + "/install/21f8dba75cf1bd9f51b97311ae64aaca?url=http://sandstorm.io/apps/etherpad9.spk")
    .waitForElementVisible('#step-confirm', very_long_wait)
    .click('#confirmInstall')
    .waitForElementVisible(appDetailsTitleSelector, short_wait)
    .assert.containsText(appDetailsTitleSelector, 'Etherpad')
    // Create grain with that user
    .waitForElementVisible(actionSelector, short_wait)
    .click(actionSelector)

    .waitForElementVisible('.grain-frame', medium_wait)
    .assert.containsText('#grainTitle', expectedEtherpadGrainTitle)
    .click('.topbar .share > .show-popup')
    .waitForElementVisible("#shareable-link-tab-header", short_wait)
    .click("#shareable-link-tab-header")
    .waitForElementVisible("#shareable-link-tab .share-token-role", medium_wait)
    .assert.valueContains("#shareable-link-tab .share-token-role", "can edit")
    .submitForm('.new-share-token')
    .waitForElementVisible('#share-token-text', medium_wait)
     // Navigate to the url with 2nd user
    .getText('#share-token-text', function(response) {
      browser
        .loginDevAccount()
        .url(response.value)
        .waitForElementVisible("button.pick-identity", short_wait)
        .click("button.pick-identity")
        .waitForElementVisible('.grain-frame', medium_wait)
        .assert.containsText('#grainTitle', expectedEtherpadGrainTitle)
        .frame('grain-frame')
        .waitForElementPresent('#editorcontainerbox', medium_wait)
        .frame(null)
        .click('.topbar .share > .show-popup')
        .waitForElementVisible("#shareable-link-tab-header", short_wait)
        .click("#shareable-link-tab-header")
        .waitForElementVisible("#shareable-link-tab .share-token-role", medium_wait)
        .assert.valueContains("#shareable-link-tab .share-token-role", "can edit")
        .submitForm('.new-share-token')
        .waitForElementVisible('#share-token-text', medium_wait)
        // Navigate to the re-shared url with 3rd user
        .getText('#share-token-text', function(response) {
          browser
            .loginDevAccount()
            .url(response.value)
            .waitForElementVisible("button.pick-identity", short_wait)
            .click("button.pick-identity")
            .waitForElementVisible('.grain-frame', medium_wait)
            .assert.containsText('#grainTitle', expectedEtherpadGrainTitle)
            .frame('grain-frame')
            .waitForElementPresent('#editorcontainerbox', medium_wait)
            .frame(null)
            .click('.topbar .share > .show-popup')
            .waitForElementVisible("#shareable-link-tab-header", short_wait)
            .click("#shareable-link-tab-header")
            .waitForElementVisible("#shareable-link-tab .share-token-role", medium_wait)
            .assert.valueContains("#shareable-link-tab .share-token-role", "can edit")
            .submitForm('.new-share-token')
            .waitForElementVisible('#share-token-text', medium_wait)
        });
    });
}

module.exports["Test grain incognito interstitial"] = function (browser) {
  browser
    // Upload app as normal user
    .loginDevAccount()
    .url(browser.launch_url + "/install/ca690ad886bf920026f8b876c19539c1?url=http://sandstorm.io/apps/ssjekyll8.spk")
    .waitForElementVisible('#step-confirm', very_long_wait)
    .click('#confirmInstall')
    .waitForElementVisible(appDetailsTitleSelector, short_wait)
    .assert.containsText(appDetailsTitleSelector, 'Hacker CMS')
    // Create grain with that user
    .waitForElementVisible(actionSelector, short_wait)
    .click(actionSelector)
    .waitForElementVisible('.grain-frame', medium_wait)
    .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
    .click('.topbar .share > .show-popup')
    .waitForElementVisible("#shareable-link-tab-header", short_wait)
    .click("#shareable-link-tab-header")
    .waitForElementVisible(".new-share-token", short_wait)
    .submitForm('.new-share-token')
    .waitForElementVisible('#share-token-text', medium_wait)
    // Navigate to the url with an anonymous user
    .getText('#share-token-text', function(response) {
      browser
        .loginDevAccount()
        .pause(short_wait)
        // Try incognito
        .url(response.value)
        .waitForElementVisible(".incognito-button", short_wait)
        .click(".incognito-button")
        .waitForElementVisible('.grain-frame', medium_wait)
        .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
        .frame('grain-frame')
        .waitForElementPresent('#publish', medium_wait)
        .assert.containsText('#publish', 'Publish')
        // Try redeeming as current user
        // TODO(someday): pick a better app that shows off the different userid/username
        .url(response.value)
        .waitForElementVisible("button.pick-identity", short_wait)
        .click("button.pick-identity")
        .waitForElementVisible('.grain-frame', medium_wait)
        .assert.containsText('#grainTitle', expectedHackerCMSGrainTitle)
        .frame('grain-frame')
        .waitForElementPresent('#publish', medium_wait)
        .assert.containsText('#publish', 'Publish')
        .frame(null)
    });
}
