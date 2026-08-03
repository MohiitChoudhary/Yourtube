const abusiveWords = [
  // Add your actual prohibited words here
  "badword1",
  "badword2",
  "badword3",
];

export const containsAbusiveWords = (text) => {
  const lowerText = text.toLowerCase();

  return abusiveWords.some((word) =>
    lowerText.includes(word.toLowerCase())
  );
};

export const isSpamComment = (text) => {
  // Check repeated same character
  // Example: aaaaaaaaaaaaa
  if (/(.)\1{7,}/.test(text)) {
    return true;
  }

  // Check excessive special characters
  const specialCharacters = text.match(
    /[^a-zA-Z0-9\s]/g
  );

  if (
    specialCharacters &&
    specialCharacters.length > text.length * 0.5
  ) {
    return true;
  }

  // Check repeated words
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 6) {
    const uniqueWords = new Set(words);

    if (
      uniqueWords.size / words.length < 0.3
    ) {
      return true;
    }
  }

  return false;
};

export const moderateComment = (text) => {
  if (containsAbusiveWords(text)) {
    return {
      allowed: false,
      reason: "Comment contains abusive language",
    };
  }

  if (isSpamComment(text)) {
    return {
      allowed: false,
      reason: "Comment appears to be spam",
    };
  }

  return {
    allowed: true,
  };
};