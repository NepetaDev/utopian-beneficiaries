/**
 * 
 * @param {String} input The string to parse
 * @returns A JS object containing a beneficiaries key with an array of JS objects containing exactly one key (username) and one value (weight).
 */
function beneficiaries(input) {
  var reMessage = /^(@utopian-bot !utopian)(.*?)$/g; // A regular expression for the entire message (including bot call).
  // Explanation: Find text that starts with @utopian-bot !utopian.
  var reMentionList = /(?: @)(\w+)(?:(?::)(\d+)(?:\%))?/g; // A regular expression for just the mention list. Mentions are formatted like this: @{username}[:{weight}%]
  /* Explanation:
  (?: @) - non-capturing group (doesn't appear in matches): check for " @"; required
  (\w+) - capturing group, alphanumeric characters: the username; required -- matches[1]
  (?:(?::)(\d+)(?:\%))? - non-capturing group, weight in the format of ":{weight}%"; optional
    (?::) - non-capturing group, the character ":"; required for the optional group to match
    (\d+) - capturing group, numeric characters, the weight; required for the optional group to match -- matches[2]
    (?:\%) - non-capturing group, the character "%", required for the optional group to match
  */
  var users = {}; // A temporary JS object with the users.
  var sum = 0; // Sum of the weights (applies only when usersWithWeightsArePresent is set to true).
  var usersWithWeightsArePresent = false; // Mode flag.
  var usersWithoutWeightsArePresent = false; // Mode flag.

  var matches = []; // Temporary array of regex matches.
  matches = reMessage.exec(input);
  
  // Check if the bot call is present and throw an error if it's not.
  if (matches && matches.length == 3) {
    // Check if a mention list is present.
    if (matches[2]) {
      var totalLength = 0; // Total length of the correct mention list, used to compare with the total length of the mention list to check for any unrelated text being present.
      var str = matches[2]; // Mention list (including malformed mentions).

      // Match all correct mentions until there are no more.
      while (true) {
        matches = reMentionList.exec(str);
        if (!matches) break;
        if (matches.length == 3) {
          totalLength += matches[0].length; // Increase the total length of the correct mention list.
          var username = matches[1];
          if (Object.keys(users).includes(username)) throw 'One username can only appear once.';
          if (Object.keys(users).length == 8) throw 'The maximum number of mentioned users is 8.';
          
          // Check if the mention we're parsing currently contains a weight.
          if (matches[2]) {
            var weight = matches[2];

            // Check if the weight is a positive number.
            if (isNaN(weight) || weight < 0) throw 'The text is not properly formatted.';
            weight = parseFloat(weight); // Cast the String to float to avoid calculation errors.

            usersWithWeightsArePresent = true; // Set the mode flag.
            users[username] = weight;
            sum += weight;
          } else {
            usersWithoutWeightsArePresent = true; // Set the mode flag.
            users[username] = null;
          }
        } else {
          throw 'The text is not properly formatted.';
        }
      }

      // Compare the lengths. If they don't match then there are extra characters in the mention list string.
      if (totalLength != str.length) throw 'The text is not properly formatted.';
    }
  } else {
    throw 'The text is not properly formatted.';
  }
  
  // Check for mode-specific requirements.
  if (usersWithWeightsArePresent && usersWithoutWeightsArePresent) throw 'Mixed input formats are not allowed.';
  if (usersWithWeightsArePresent && sum != 100) throw 'The sum of weight should be exactly 100.';

  // Return data.
  if (usersWithWeightsArePresent) { // The mention list is in the following format: @u1:15 @u2:35 @u3:25 @u4:25
    return {
      // Convert our temporary array to match the required format.
      beneficiaries: Object.keys(users).map((user) => {
        var obj = {};
        obj[user] = users[user];
        return obj;
      })
    };
  } else { // The mention list is in the following format: @u1 @u2 @u3 @u4 (or there is no mention list).
    var count = Object.keys(users).length;
    if (count > 0) {
      var weight = 100/count; // Calculate the weight.
      return {
        // Convert our temporary array to match the required format.
        beneficiaries: Object.keys(users).map((user) => {
          var obj = {};
          obj[user] = weight;
          return obj;
        })
      };
    } else {
      return {
        // No beneficiaries.
        beneficiaries: []
      };
    }
  }
}

module.exports = beneficiaries;