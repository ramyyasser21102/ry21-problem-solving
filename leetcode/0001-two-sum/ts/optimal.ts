export function twoSumOptimal(nums: number[], target: number): number[] | undefined {
  const numsLength = nums.length;
  const differenceMap = new Map();
  for (let i = 0; i < numsLength; i++) {
    let difference = target - nums[i];
    if (differenceMap.has(difference)) {
      return [differenceMap.get(difference), i];
    }
    differenceMap.set(nums[i], i);
  }
}
