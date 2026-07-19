import useLocale from "hooks/useLocale";
import { PhoneNumberUtil } from "google-libphonenumber";
import useLang from "./useLang";

export const useValidations = () => {
  const { formatMessage } = useLocale();
  const { default_lang_shortening } = useLang();

  ////////////////////// PHONE VALIDATION WITH LIBRARY ////////////////////
  const phoneUtil = PhoneNumberUtil.getInstance();

  const required_object = () => {
    return {
      isValid: false,
      error: formatMessage("requiredArea", "Required area"),
    };
  };

  const required_area = (input) => {
    if (!input || input?.length === 0) {
      return required_object();
    } else {
      return { isValid: true, error: "" };
    }
  };

  const not_zero_validation = (input) => {
    // Boşsa direk geçerli saymayalım
    if (input === null || input === undefined || input === "") {
      return {
        isValid: false,
        error: formatMessage(
          "pleaseEnterValueGreaterThan0",
          "Please enter a value greater than 0"
        ),
      };
    }

    // Sayıya çevir
    const num = Number(input);

    // Eğer sayı değilse (NaN) direkt hata dönebilirsin
    if (isNaN(num)) {
      return {
        isValid: false,
        error: formatMessage(
          "pleaseEnterValidNumber",
          "Please enter a valid number"
        ),
      };
    }

    // Sıfır veya 0.00, 00.00 gibi varyasyonların hepsi num === 0 çıkar
    if (num === 0) {
      return {
        isValid: false,
        error: formatMessage(
          "pleaseEnterValueGreaterThan0",
          "Please enter a value greater than 0"
        ),
      };
    }

    return { isValid: true, error: "" };
  };

  const main_lang_validation = (input, max = 1000) => {
    if (!input || input?.length === 0) {
      return {
        isValid: false,
        error: formatMessage(
          "pleaseEnterTheLangContent",
          `Please enter the '${default_lang_shortening}' content`
        ),
      };
    } else if (input?.length > max) {
      return {
        isValid: false,
        error: formatMessage(
          "theContentMustBeLessThan",
          `The '${default_lang_shortening}' content must be less than ${max} character`
        ),
      };
    } else {
      return { isValid: true, error: "" };
    }
  };

  const min_validation = (input, min_length) => {
    if (input.length < min_length) {
      return {
        isValid: false,
        error: formatMessage(
          "minLength",
          `Minimum ${min_length} characters required`
        ),
      };
    } else {
      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const max_validation = (input, max_length) => {
    if (input?.length > max_length) {
      return {
        isValid: false,
        error: formatMessage(
          "maxLength",
          `Maximum ${max_length} characters required`
        ),
      };
    } else {
      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const short_input_validation = (input, is_required = false) => {
    // Check if is required
    if (!is_required && !input) {
      return { isValid: true, error: "" };
    } else {
      // Check if is input empty
      if (!input) {
        return {
          isValid: false,
          error: formatMessage("requiredArea", "Required area"),
        };
      }
      // Check max length
      if (input.length > 64) {
        return {
          isValid: false,
          error: formatMessage(
            "max64CharactersRequired",
            "Maximum 64 characters required"
          ),
        };
      }
      //Check min length
      if (input.length < 2) {
        return {
          isValid: false,
          error: formatMessage(
            "min2CharactersRequired",
            "Minimum 2 characters required"
          ),
        };
      }
      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const middle_input_validation = (input, is_required = false) => {
    // Check if is required
    if (!is_required && !input) {
      return { isValid: true, error: "" };
    } else {
      // Check if is input empty
      if (!input) {
        return {
          isValid: false,
          error: formatMessage("requiredArea", "Required area"),
        };
      }
      // Check max length
      if (input.length > 255) {
        return {
          isValid: false,
          error: formatMessage(
            "max255CharactersRequired",
            "Maximum 255 characters required"
          ),
        };
      }
      //Check min length
      if (input.length < 2) {
        return {
          isValid: false,
          error: formatMessage(
            "min2CharactersRequired",
            "Minimum 2 characters required"
          ),
        };
      }
      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const semi_long_input_validation = (input, is_required = false) => {
    // Check if is required
    if (!is_required && !input) {
      return { isValid: true, error: "" };
    } else {
      // Check if is input empty
      if (!input) {
        return {
          isValid: false,
          error: formatMessage("requiredArea", "Required area"),
        };
      }
      // Check max length
      if (input.length > 500) {
        return {
          isValid: false,
          error: formatMessage(
            "max500CharactersRequired",
            "Maximum 500 characters required"
          ),
        };
      }
      //Check min length
      if (input.length < 2) {
        return {
          isValid: false,
          error: formatMessage(
            "min2CharactersRequired",
            "Minimum 2 characters required"
          ),
        };
      }
      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const long_input_validation = (input, is_required = false) => {
    // Check if is required
    if (!is_required && !input) {
      return { isValid: true, error: "" };
    } else {
      // Check if is input empty
      if (!input) {
        return {
          isValid: false,
          error: formatMessage("requiredArea", "Required area"),
        };
      }
      // Check max length
      if (input.length > 1000) {
        return {
          isValid: false,
          error: formatMessage(
            "max1000CharactersRequired",
            "Maximum 1000 characters required"
          ),
        };
      }
      //Check min length
      if (input.length < 2) {
        return {
          isValid: false,
          error: formatMessage(
            "min2CharactersRequired",
            "Minimum 2 characters required"
          ),
        };
      }
      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const email_validation = (input, is_required = false) => {
    // Check if is required
    if (!is_required && !input) {
      return { isValid: true, error: "" };
    } else {
      // Check if is input empty
      if (!input) {
        return {
          isValid: false,
          error: formatMessage("requiredArea", "Required area"),
        };
      }
      // Check if is input empty
      if (input.length > 255) {
        return {
          isValid: false,
          error: formatMessage(
            "max255CharactersRequired",
            "Maximum 255 characters required"
          ),
        };
      }
      // Regex to validate email format
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(input)) {
        return {
          isValid: false,
          error: formatMessage("invalidEmailFormat", "Invalid email format"),
        };
      }

      // Validate no leading/trailing underscores, dots, or dashes in the local part
      const localPart = input.split("@")[0];
      const hasLeadingOrTrailing = /^[_.-]|[_.-]$/.test(localPart);
      if (hasLeadingOrTrailing) {
        return {
          isValid: false,
          error: formatMessage("invalidEmailFormat", "Invalid email format"),
        };
      }

      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const url_validation = (input, is_required = false) => {
    // Check if is required
    if (!is_required && !input) {
      return { isValid: true, error: "" };
    } else {
      // Check if is input empty
      if (!input) {
        return {
          isValid: false,
          error: formatMessage("requiredArea", "Required area"),
        };
      }
      // Check if is input empty
      if (input.length > 255) {
        return {
          isValid: false,
          error: formatMessage(
            "max255CharactersRequired",
            "Maximum 255 characters required"
          ),
        };
      }
      // Regex to validate url format
      const urlRegex =
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[a-zA-Z0-9@:%._+~#&=\-\/]*)?(\?[a-zA-Z0-9@:%._+~#&=\-]*)?$/;

      if (!urlRegex.test(input)) {
        return {
          isValid: false,
          error: formatMessage("invalidUrlFormat", "Invalid url format"),
        }; // Invalid url format
      }

      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const phone_validation = (input) => {
    if (
      input &&
      input.trim().length >= 4 &&
      !phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(input))
    ) {
      return {
        isValid: false,
        error: formatMessage("notValidPhoneNumber", "Not a valid phone number"),
      }; // Invalid phone number
    }

    // If all checks pass
    return { isValid: true, error: "" };
  };

  const password_validation = (input, is_required = false) => {
    // Check if is required
    if (!is_required && !input) {
      return { isValid: true, error: "" };
    } else {
      // Check if is input empty
      if (!input) {
        return {
          isValid: false,
          error: formatMessage("requiredArea", "Required area"),
        };
      }
      // Check if is input empty
      if (input.length > 64) {
        return {
          isValid: false,
          error: formatMessage(
            "max64CharactersRequired",
            "Maximum 64 characters required"
          ),
        };
      }
      // Regex for validation
      const hasLowercase = /[a-z]/.test(input);
      const hasUppercase = /[A-Z]/.test(input);
      const hasNumber = /\d/.test(input);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(input);
      const isCorrectLength = input.length >= 8 && input.length <= 64;
      const noSpaces = /^[^\s]+$/.test(input);

      if (!hasLowercase) {
        return {
          isValid: false,
          error: formatMessage(
            "missingLowercase",
            "Password must contain at least 1 lowercase letter"
          ),
        };
      }

      if (!hasUppercase) {
        return {
          isValid: false,
          error: formatMessage(
            "missingUppercase",
            "Password must contain at least 1 uppercase letter"
          ),
        };
      }

      if (!hasNumber) {
        return {
          isValid: false,
          error: formatMessage(
            "missingNumber",
            "Password must contain at least 1 number"
          ),
        };
      }

      if (!hasSymbol) {
        return {
          isValid: false,
          error: formatMessage(
            "missingSymbol",
            "Password must contain at least 1 special character"
          ),
        };
      }

      if (!isCorrectLength) {
        return {
          isValid: false,
          error: formatMessage(
            "invalidLength",
            "Password must be between 8 and 64 characters"
          ),
        };
      }

      if (!noSpaces) {
        return {
          isValid: false,
          error: formatMessage(
            "containsSpaces",
            "Password cannot contain spaces"
          ),
        };
      }

      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  const particular_password_validation = (input) => {
    let validateTypes = [];
    // Regex for validation
    const hasLowercase = /[a-z]/.test(input);
    const hasUppercase = /[A-Z]/.test(input);
    const hasNumber = /\d/.test(input);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(input);
    const isCorrectLength = input.length >= 8 && input.length <= 64;
    const noSpaces = /^[^\s]+$/.test(input);

    if (!hasLowercase) {
      validateTypes.push("lower");
    }

    if (!hasUppercase) {
      validateTypes.push("upper");
    }

    if (!hasNumber) {
      validateTypes.push("number");
    }

    if (!hasSymbol) {
      validateTypes.push("special");
    }

    if (!isCorrectLength) {
      validateTypes.push("character");
    }

    if (!noSpaces) {
      validateTypes.push("space");
    }
    console.log("validateTypes: ", validateTypes.length);

    // If all checks pass
    if (validateTypes.length === 0) {
      return { isValid: true, type: [] };
    } else {
      return {
        isValid: false,
        type: validateTypes,
      };
    }
  };

  const social_media_validation = (
    input,
    is_required = false,
    type = "linkedin"
  ) => {
    // Check if is required
    if (!is_required && !input) {
      return { isValid: true, error: "" };
    } else {
      // Check if is input empty
      if (!input) {
        return {
          isValid: false,
          error: formatMessage("requiredArea", "Required area"),
        };
      }
      // Check if is input empty
      if (input.length > 255) {
        return {
          isValid: false,
          error: formatMessage(
            "max255CharactersRequired",
            "Maximum 255 characters required"
          ),
        };
      }

      // const patterns = {
      //   linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.*$/i,
      //   instagram: /^https?:\/\/(www\.)?instagram\.com\/.*$/i,
      //   twitter: /^https?:\/\/(www\.)?twitter\.com\/.*$/i,
      // };

      // const regex = patterns[type];

      // if (regex && !regex.test(input)) {
      //   return {
      //     isValid: false,
      //     error: formatMessage(
      //       `invalid${type}Format`,
      //       `Invalid ${type} format`
      //     ),
      //   };
      // }

      if (!input.includes(type)) {
        return {
          isValid: false,
          error: formatMessage(
            `invalid${type}Format`,
            `Invalid ${type} format`
          ),
        }; // Invalid LinkedIn URL format
      }

      // If all checks pass
      return { isValid: true, error: "" };
    }
  };

  return {
    required_area,
    not_zero_validation,
    main_lang_validation,
    min_validation,
    max_validation,
    email_validation,
    url_validation,
    phone_validation,
    password_validation,
    short_input_validation,
    middle_input_validation,
    long_input_validation,
    semi_long_input_validation,
    social_media_validation,
    particular_password_validation,
  };
};
