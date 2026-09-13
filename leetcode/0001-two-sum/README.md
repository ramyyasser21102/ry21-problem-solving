---
platform: leetcode
id: "1"
slug: two-sum
difficulty: Easy
tags: [array, hash-map]
url: https://leetcode.com/problems/two-sum/
status:
  ts:
    brute: solved
    optimal: solved
---

# Two Sum

Given an array of integers and a target, return the indices of the two numbers that add up to the target.

## Approaches

- **`brute`** — nested-loop pairwise check. O(n²) time, O(1) space.
- **`optimal`** — single pass with a hash map from value to index, checking for the complement on each step. O(n) time, O(n) space.
