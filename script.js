const lengthSlider = document.querySelector(".pass-length input"),
  options = document.querySelectorAll(".option input"),
  copyIcon = document.querySelector(".input-box span"),
  passwordInput = document.querySelector(".input-box input"),
  passIndicator = document.querySelector(".pass-indicator"),
  generateBtn = document.querySelector(".generate-btn");

const characters = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "^!$%&|[](){}:;.,*+-#@<>~"
};

let requestCount = 0;
let lastRequestTime = 15;

const generatePassword = () => {
  // Check if rate limit exceeded
  const currentTime = new Date().getTime();
  if (currentTime - lastRequestTime < 60000) {
    if (requestCount >= 100 ) {
      alert("Rate limit exceeded. Please try again later.");
      return;
    }
  } else {
    requestCount = 0;
    lastRequestTime = currentTime;
  }
  
  // Increment request counter
  requestCount++;
  
  const sjclOptions = {
    iter: 10000,
    salt: sjcl.random.randomWords(2, 0),
    prng: sjcl.random
  };

  let selectedChars = "";
  let excludeDuplicate = false;
  let passLength = lengthSlider.value < 12 ? 12 : lengthSlider.value;

  options.forEach(option => {
    if (option.checked) {
      if (option.id !== "exc-duplicate" && option.id !== "spaces") {
        selectedChars += characters[option.id];
      } else if (option.id === "spaces") {
        selectedChars += " ";
      } else {
        excludeDuplicate = true;
      }
    }
  });

  let randomPassword = "";
  let usedChars = []; // keep track of used characters
  while (randomPassword.length < passLength) {
    let randomChar = selectedChars.charAt(secureRandomInRange(0, selectedChars.length - 1));
    if (excludeDuplicate) {
      if (!usedChars.includes(randomChar) || randomChar === " ") {
        usedChars.push(randomChar);
        randomPassword += randomChar;
      }
    } else {
      randomPassword += randomChar;
    }
  }
  
  
  
  // Avoid predictable patterns
  const pattern = /(.)\1{2,}/g; // Matches any character that repeats 3 or more times
  while (randomPassword.match(pattern)) {
    randomPassword = randomPassword.replace(pattern, () => {
      return selectedChars.charAt(secureRandomInRange(0, selectedChars.length - 1));
    });
  }

  passwordInput.type = "text";
  passwordInput.value = randomPassword;
  setTimeout(() => {
    passwordInput.type = "password";
  }, 5000);
};



const upadatePassIndicator = () => {
  passIndicator.id = lengthSlider.value <= 8 ? "weak" : lengthSlider.value <= 16 ? "medium" : "strong";
};

const updateSlider = () => {
  const minLength = 12; // Set minimum length to 12 characters
  let passwordLength = parseInt(lengthSlider.value);
  if (passwordLength < minLength) {
    passwordLength = minLength;
    lengthSlider.value = passwordLength;
  }
  document.querySelector(".pass-length span").innerText = passwordLength;
  generatePassword();
  upadatePassIndicator();
};

// Helper function to generate a cryptographically secure random number between min and max (inclusive)
const secureRandomInRange = (min, max) => {
  return sjcl.random.randomWords(1, 0)[0] % (max - min + 1) + min;
};

generateBtn.addEventListener("click", () => {
  generatePassword();
});

copyIcon.addEventListener("click", () => {
  passwordInput.select();
  document.execCommand("copy");
});

lengthSlider.addEventListener("input", updateSlider);




updateSlider();
