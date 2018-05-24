/**
 * 
 * @param {String} input The string to parse
 * @returns A JS object containing a beneficiaries key with an array of JS objects containing exactly one key (username) and one value (weight).
 */
function beneficiaries(input) {
  var reMessage = /^(?:@utopian-bot !utopian)(.*?)$/g; // A regular expression for the entire message (including bot call).
  // Explanation: Find text that comes after @utopian-bot !utopian.
  var reMentionList = /(?: @)(\w+)(?:(?::)(\d*\.?\d+)(?:\%))?/g; // A regular expression for just the mention list. Mentions are formatted like this: @{username}[:{weight}%]
  /* Explanation:
  (?: @) - non-capturing group (doesn't appear in matches): check for " @"; required
  (\w+) - capturing group, alphanumeric characters: the username; required -- matches[1]
  (?:(?::)(\d+)(?:\%))? - non-capturing group, weight in the format of ":{weight}%"; optional
    (?::) - non-capturing group, the character ":"; required for the optional group to match
    (\d*\.?\d+) - capturing group, decimal value, the weight; required for the optional group to match -- matches[2]
    (?:\%) - non-capturing group, the character "%", required for the optional group to match
  */
  const MAX_MENTIONS = 8;
  var users = {}; // A temporary JS object with the users.
  var sum = 0; // Sum of the weights (applies only when usersWithWeightsArePresent is set to true).
  var usersWithWeightsArePresent = false; // Mode flag.
  var usersWithoutWeightsArePresent = false; // Mode flag.
  var matches = reMessage.exec(input); // Temporary array of regex matches.
  
  // Check if the bot call is present and throw an error if it's not.
  if (!matches) throw 'The text is not properly formatted.';

  // Check if a mention list is present.
  var mentionList = matches[1]; // Mention list (including malformed mentions).
  if (mentionList) {
    let totalLength = 0; // Total length of the correct mention list, used to compare with the total length of the mention list to check for any unrelated text being present.

    // Match all correct mentions until there are no more.
    while (matches = reMentionList.exec(mentionList)) {
      let [element, username, weight] = matches;

      totalLength += element.length; // Increase the total length of the correct mention list.
      if (Object.keys(users).includes(username)) throw 'One username can only appear once.'; // Duplicate check.
      if (Object.keys(users).length >= MAX_MENTIONS) throw 'The maximum number of mentioned users is ' + MAX_MENTIONS + '.';
      
      // Check if the mention we're parsing currently contains a weight.
      if (weight) {
        usersWithWeightsArePresent = true; // Set the mode flag.
        sum += users[username] = parseFloat(weight); // Cast the String to float to avoid calculation errors.
      } else {
        usersWithoutWeightsArePresent = true; // Set the mode flag.
        users[username] = null;
      }
    }

    // Compare the lengths. If they don't match then there are extra characters in the mention list string.
    if (totalLength != mentionList.length) throw 'The text is not properly formatted.';
  }
  
  // Check for mode-specific requirements.
  if (usersWithWeightsArePresent && usersWithoutWeightsArePresent) throw 'Mixed input formats are not allowed.';
  if (usersWithWeightsArePresent && sum != 100) throw 'The sum of weights should be exactly 100.';

  var usernames = Object.keys(users); // Get an array of the mentioned usernames.
  var weight = (usernames.length > 0) ? 100/usernames.length : null; // Calculate the weight.

  return {
    // Convert our temporary array to match the required format.
    beneficiaries: usernames.map((username) => ({ [username]: (users[username]) ? users[username] : weight }))
  };
}

module.exports = beneficiaries;