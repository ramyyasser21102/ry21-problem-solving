export const twoSumBrute = (nums: number[], target: number): number[] | undefined => {
  const numsLength = nums.length;
  for (let i = 0; i < numsLength; i++) {
    let augend = nums[i];
    for (let j = i + 1; j < numsLength; j++) {
      let addend = nums[j];
      let sum = augend + addend;
      if (sum === target) {
        return [i, j];
      }
    }
  }
};
