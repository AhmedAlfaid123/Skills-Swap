function getSkillIds(list) {
  return list.map((item) => item.skillId.toString());
}

function findOverlap(theirSkills, mySkills) {
  const mySet = new Set(getSkillIds(mySkills));
  return theirSkills.filter((item) => mySet.has(item.skillId.toString()));
}

function computeMatch(me, otherUser) {
  const theyCanTeachYou = findOverlap(otherUser.skillsToTeach, me.skillsToLearn);
  const youCanTeachThem = findOverlap(otherUser.skillsToLearn, me.skillsToTeach);
 
  return {
    theyCanTeachYou,
    youCanTeachThem,
    isMutual: theyCanTeachYou.length > 0 && youCanTeachThem.length > 0,
  };
}
 
module.exports = { findOverlap, computeMatch };




