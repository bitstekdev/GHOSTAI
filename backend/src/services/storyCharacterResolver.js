const TrainedCharacter = require("../models/TrainedCharacter");

exports.resolveCharacters = async (text, userId) => {
  // Parse @Name syntax from text
  const matches = [...text.matchAll(/@(\w+)/g)];
  
  if (!matches.length) {
    return { fixedText: text, characters: [] };
  }

  // Extract unique names (lowercase)
  const names = [...new Set(matches.map(m => m[1].toLowerCase()))];

  // Find trained characters matching the names
  const characters = await TrainedCharacter.find({
    user: userId,
    triggerWord: { $in: names },
    status: "ready"
  });

  if (!characters.length) {
    return { fixedText: text, characters: [] };
  }

  // Replace @Name with Name in text
  let fixedText = text;
  characters.forEach(c => {
    const regex = new RegExp(`@${c.triggerWord}`, "gi");
    fixedText = fixedText.replace(regex, c.name);
  });

  return { fixedText, characters };
};
