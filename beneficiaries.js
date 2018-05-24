/**
 * 
 * @param {String} input The string to parse
 * @returns A JS object containing a beneficiaries key with an array of JS objects containing exactly one key (username) and one value (weight).
 */
function beneficiaries(input) {
  var reMessage = /^(?:@utopian-bot !utopian)(.*?)$/g; // A regular expression for the entire message (including bot call).
  // Explanation: Finds text that comes after @utopian-bot !utopian.
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
  var weightSum = 0; // Sum of the weights (applies only when usersWithWeightsArePresent is set to true).
  var automaticallyCalculateWeights = true; // Mode flag.
  var matches = reMessage.exec(input); // Temporary array of regex matches.
  
  if (!matches) throw 'The text is not properly formatted.'; // Check if the bot call is present at the beginning of the string and throw an error if it's not.
  var mentionList = matches[1]; // Mention list (including malformed mentions).
  if (mentionList) { // Check if a mention list is present.
    let totalLength = 0; // Total length of the correct mention list, used to compare with the total length of the mention list to check for any unrelated text being present.

    while (matches = reMentionList.exec(mentionList)) { // Match all correct mentions until there are no more.
      let [element, username, weight] = matches; // Destructure the matches array into local variables.
      if ((weight && automaticallyCalculateWeights) || (!weight && !automaticallyCalculateWeights)) {
        if (totalLength > 0) throw 'The text is not properly formatted.'; // This means that there are mentions with no weight attached somewhere, and we're trying to attach a weight now (or vice versa).
        automaticallyCalculateWeights = false; // Change the mode. It can only change to false, a change from true to false and then back to true would trigger the above condition anyway.
      }
      totalLength += element.length; // Increase the total length of the correct mention list.
      if (Object.keys(users).includes(username)) throw 'One username can only appear once.'; // Duplicate check.
      if (Object.keys(users).length >= MAX_MENTIONS) throw 'The maximum number of mentioned users is ' + MAX_MENTIONS + '.';
      weightSum += users[username] = parseFloat(weight); // Cast from string to float to avoid calculation errors. I'm aware that we're adding NaNs here, but doing that is actually less CPU-intensive than jumps (ifs).
    }

    // Compare the lengths. If they don't match then there are extra characters in the mention list string.
    if (totalLength != mentionList.length) throw 'The text is not properly formatted.';
    // Check weight sum if we're not using automatic weight calculation.
    if (!automaticallyCalculateWeights && weightSum != 100) throw 'The sum of weights should be exactly 100.';
  }
  
  var usernames = Object.keys(users); // Get an array of the mentioned usernames.
  var weight = 100/usernames.length; // Calculate the weight. We can avoid an if here too, division by zero doesn't throw an exception in JS.
  return { // Convert our temporary array to match the required format.
    beneficiaries: usernames.map((username) => ({ [username]: users[username] || weight }))
  };
}

module.exports = beneficiaries;