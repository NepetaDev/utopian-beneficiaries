const beneficiaries = require('./beneficiaries');

test('call with no arguments returns no beneficiaries: @utopian-bot !utopian', () => {
  expect(beneficiaries('@utopian-bot !utopian')).toEqual({ beneficiaries: [] });
});

test('call with beneficiaries without weights returns the same weight for all: @utopian-bot !utopian @u1 @u2 @u3 @u4', () => {
  var map = beneficiaries('@utopian-bot !utopian @u1 @u2 @u3 @u4').beneficiaries.map((beneficiary) => beneficiary[Object.keys(beneficiary)[0]]);
  expect(map).toEqual([25, 25, 25, 25]);
});

test('call with beneficiaries with weights returns the provided weights: @utopian-bot !utopian @u1:15% @u2:35% @u3:25% @u4:25%', () => {
  var map = beneficiaries('@utopian-bot !utopian @u1:15% @u2:35% @u3:25% @u4:25%').beneficiaries.map((beneficiary) => beneficiary[Object.keys(beneficiary)[0]]);
  expect(map).toEqual([15, 35, 25, 25]);
});

test('call with beneficiaries with weights that do not sum to 100 throws: @utopian-bot !utopian @u1:15% @u2:75% @u3:25% @u4:25%', () => {
  expect(() => beneficiaries('@utopian-bot !utopian @u1:15% @u2:75% @u3:25% @u4:25%')).toThrow('The sum of weights should be exactly 100.');
});

test('call with beneficiaries with weights are not numbers throws: @utopian-bot !utopian @u1:a% @u2:x% @u3:25% @u4:25%', () => {
  expect(() => beneficiaries('@utopian-bot !utopian @u1:a% @u2:x% @u3:25% @u4:25%')).toThrow('The text is not properly formatted.');
});

test('call with beneficiaries with weights are not positive throws: @utopian-bot !utopian @u1:-10% @u2:60% @u3:25% @u4:25%', () => {
  expect(() => beneficiaries('@utopian-bot !utopian @u1:-10% @u2:60% @u3:25% @u4:25%')).toThrow('The text is not properly formatted.');
});

test('call with malformed bot mention/command throws: @utopian-bot !ut0pian @u1:15% @u2:35% @u3:25% @u4:25%', () => {
  expect(() => beneficiaries('@utopian-bot !ut0pian @u1:15% @u2:35% @u3:25% @u4:25%')).toThrow('The text is not properly formatted.');
});

test('call with more than 8 beneficiaries throws: @utopian-bot !utopian @u1 @u2 @u3 @u4 @u5 @u6 @u7 @u8 @u9', () => {
  expect(() => beneficiaries('@utopian-bot !utopian @u1 @u2 @u3 @u4 @u5 @u6 @u7 @u8 @u9')).toThrow('The maximum number of mentioned users is 8.');
});

test('call with repeating beneficiaries throws: @utopian-bot !utopian @u1 @u2 @u3 @u3', () => {
  expect(() => beneficiaries('@utopian-bot !utopian @u1 @u2 @u3 @u3')).toThrow('One username can only appear once.');
});

test('call with unrelated text in the mention part throws: @utopian-bot !utopian @u1 @u2 @u3 why', () => {
  expect(() => beneficiaries('@utopian-bot !utopian @u1 @u2 @u3 why')).toThrow('The text is not properly formatted.');
});

test('call with unrelated text in the bot call part throws: @utopian-bot unf !utopian @u1 @u2 @u3', () => {
  expect(() => beneficiaries('@utopian-bot unf !utopian @u1 @u2 @u3')).toThrow('The text is not properly formatted.');
});