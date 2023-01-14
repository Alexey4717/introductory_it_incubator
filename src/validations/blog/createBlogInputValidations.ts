import {commonValidationForBodyStrings} from '../common';
import {
    descriptionValidation,
    nameValidation,
    websiteUrlValidation
} from "./index";


export const createBlogInputValidations = [
    commonValidationForBodyStrings,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation
];
