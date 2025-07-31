document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM Elements
    const passwordLengthSlider = document.getElementById('passwordLength');
    const lengthValueSpan = document.getElementById('lengthValue');
    const includeUppercaseCheckbox = document.getElementById('includeUppercase');
    const includeLowercaseCheckbox = document.getElementById('includeLowercase');
    const includeNumbersCheckbox = document.getElementById('includeNumbers');
    const includeSymbolsCheckbox = document.getElementById('includeSymbols');
    const excludeCharactersInput = document.getElementById('excludeCharacters');
    const generateBtn = document.getElementById('generateBtn');
    const generatedPasswordInput = document.getElementById('generatedPassword');
    const copyBtn = document.getElementById('copyBtn');
    const errorMessageDiv = document.getElementById('errorMessage');

    // Define character sets
    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
    };

    // 2. Event Listeners
    passwordLengthSlider.addEventListener('input', () => {
        lengthValueSpan.textContent = passwordLengthSlider.value;
    });

    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyPassword);

    // Initial update of length value
    lengthValueSpan.textContent = passwordLengthSlider.value;

    // 3. Core Logic: Generate Password Function
    function generatePassword() {
        errorMessageDiv.textContent = ''; // Clear previous errors

        const length = parseInt(passwordLengthSlider.value);
        const includeUppercase = includeUppercaseCheckbox.checked;
        const includeLowercase = includeLowercaseCheckbox.checked;
        const includeNumbers = includeNumbersCheckbox.checked;
        const includeSymbols = includeSymbolsCheckbox.checked;
        const excludeChars = excludeCharactersInput.value;

        // Build the pool of possible characters
        let possibleChars = '';
        let requiredChars = []; // To ensure at least one of each selected type

        if (includeUppercase) {
            possibleChars += charSets.uppercase;
            requiredChars.push(getRandomChar(charSets.uppercase));
        }
        if (includeLowercase) {
            possibleChars += charSets.lowercase;
            requiredChars.push(getRandomChar(charSets.lowercase));
        }
        if (includeNumbers) {
            possibleChars += charSets.numbers;
            requiredChars.push(getRandomChar(charSets.numbers));
        }
        if (includeSymbols) {
            possibleChars += charSets.symbols;
            requiredChars.push(getRandomChar(charSets.symbols));
        }

        // Validate that at least one character type is selected
        if (possibleChars === '') {
            errorMessageDiv.textContent = 'Please select at least one character type.';
            generatedPasswordInput.value = '';
            return;
        }

        // Filter out excluded characters from the possibleChars pool
        // Techy Bit: Using a Set for efficient exclusion check
        const excludeSet = new Set(excludeChars.split(''));
        let finalPossibleChars = Array.from(possibleChars).filter(char => !excludeSet.has(char)).join('');

        // Also filter out excluded characters from requiredChars, and re-generate if necessary
        for (let i = 0; i < requiredChars.length; i++) {
            if (excludeSet.has(requiredChars[i])) {
                // If a required char was excluded, try to regenerate it from its specific set
                // This is a bit tricky, if the *entire specific set* is excluded, we have a problem.
                // For now, if a required char from its specific set is excluded, we'll just try to regenerate
                // from the remaining of that set. If the set becomes empty, it's a more complex error.
                // For simplicity here, we'll allow it to potentially fail if ALL chars of a required type are excluded.
                // A more robust solution would check if the specific char set, after exclusions, is empty.
                let originalSet = '';
                if (includeUppercase && charSets.uppercase.includes(requiredChars[i])) originalSet = charSets.uppercase;
                else if (includeLowercase && charSets.lowercase.includes(requiredChars[i])) originalSet = charSets.lowercase;
                else if (includeNumbers && charSets.numbers.includes(requiredChars[i])) originalSet = charSets.numbers;
                else if (includeSymbols && charSets.symbols.includes(requiredChars[i])) originalSet = charSets.symbols;
                
                let filteredOriginalSet = Array.from(originalSet).filter(char => !excludeSet.has(char)).join('');
                if (filteredOriginalSet.length > 0) {
                    requiredChars[i] = getRandomChar(filteredOriginalSet);
                } else {
                    // This scenario means a required character type has been fully excluded
                    errorMessageDiv.textContent = `Error: All characters for a required type (e.g., ${originalSet[0]}) have been excluded.`;
                    generatedPasswordInput.value = '';
                    return;
                }
            }
        }
        
        // Final check on the pool after exclusions.
        // This handles cases where all initially selected chars get excluded.
        if (finalPossibleChars.length === 0) {
            errorMessageDiv.textContent = 'Error: All possible characters have been excluded. Please adjust your filters.';
            generatedPasswordInput.value = '';
            return;
        }


        let passwordArray = [...requiredChars]; // Start with the required characters

        // Fill the rest of the password length
        for (let i = passwordArray.length; i < length; i++) {
            passwordArray.push(getRandomChar(finalPossibleChars));
        }

        // Techy Bit: Shuffle the password array to randomize the position of required characters
        shuffleArray(passwordArray);

        generatedPasswordInput.value = passwordArray.join('');
    }

    // Helper function to get a random character from a string
    function getRandomChar(charString) {
        const randomIndex = Math.floor(Math.random() * charString.length);
        return charString[randomIndex];
    }

    // Helper function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    // 4. Copy to Clipboard Function
    function copyPassword() {
        generatedPasswordInput.select(); // Select the text
        generatedPasswordInput.setSelectionRange(0, 99999); // For mobile devices

        // Attempt to copy using Clipboard API
        navigator.clipboard.writeText(generatedPasswordInput.value)
            .then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'COPIED!';
                copyBtn.style.backgroundColor = '#27ae60'; // Change to green on success
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = '#2ecc71'; // Revert to original green
                }, 1500);
            })
            .catch(err => {
                errorMessageDiv.textContent = 'Failed to copy password. Please copy manually.';
                console.error('Error copying to clipboard: ', err);
            });
    }

    // Generate a password on initial load
    generatePassword();
});
