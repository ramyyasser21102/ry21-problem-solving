function containsDuplicate(nums: number[]): boolean {
  const length = nums.length;

  if (length === 1) return false;

  const duplicatesMap = new Map<number, number>();

  for (let i = 0; i < length; i++) {
    let currentRepetitions;
    currentRepetitions = duplicatesMap.get(nums[i]);
    if (currentRepetitions === undefined) currentRepetitions = 0;
    duplicatesMap.set(nums[i], currentRepetitions + 1);
    if (duplicatesMap.get(nums[i])!! > 1) return true;
  }
  return false;
}

console.log(containsDuplicate([0]));
