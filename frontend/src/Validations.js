import dayjs from 'dayjs';

export const validateEmail = email => {
	const validEmail = new RegExp('[a-z0-9]+@[a-z]+\\.[a-z]{2,3}');
	return validEmail.test(email);
};

export const validateSelectInput = input => {
	return input !== null && input !== undefined && input !== '';
};

export const validateEmailLength = email => {
	return email.trim().length > 0;
};

export const validatePasswordLength = password => {
	return password.trim().length > 0;
};

export const validationIsString = text => {
	const validString = new RegExp('[a-zA-Z]+');
	return validString.test(text) && text.length > 0;
};

export const validateNameLength = name => {
	return name.trim().length > 2 && name.trim().length <= 100;
};

export const validateLastNameLength = lastName => {
	return lastName.trim().length > 2 && lastName.trim().length <= 100;
};

export const validatePhoneNumber = phoneNumber => {
	const validNumber = new RegExp('^s*-?[0-9]{1,10}s*$');
	return (
		phoneNumber.trim().length > 7 &&
		phoneNumber.trim().length < 9 &&
		validNumber.test(phoneNumber)
	);
};

export const validateCiNumber = ciNumber => {
	const validNumber = new RegExp('^s*-?[0-9]{1,10}s*$');
	return ciNumber.trim().length > 6 && validNumber.test(ciNumber);
};

export const validateDateBirth = birthDate => {
	const validDateBirth = new RegExp(
		'^(0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])[-/.](19|20)\\d\\d$'
	);
	return validDateBirth.test(birthDate);
};

export const validateAddressLength = address => {
	return address.trim().length > 10 && address.trim().length <= 200;
};

export const validateRegisterNumberLength = registerNumber => {
	return (
		registerNumber.trim().length > 3 && registerNumber.trim().length <= 20
	);
};

export const validateCosto = costo => {
	const costRegex = /^\d{1,8}(\.\d{1,2})?$/;
	const numValue = parseFloat(costo);
	return costRegex.test(costo) && numValue > 0;
};

export const validatePercentageVisa = percentageVisa => {
	return percentageVisa >= 0 && percentageVisa <= 100;
};

export const validateCode = code => {
	const codeRegex = /^[a-zA-Z0-9\s_-]+$/;
	return codeRegex.test(code) && code.length > 0;
};

export const validatePositiveNumber = number => {
	return parseInt(number) >= 0;
};

export const validateActualDate = date => {
	// If date is empty, it's valid (optional field)
	if (!date || date.trim() === '') return true;
	// Check if it's a valid date and not before today
	return dayjs(date).isValid() && !dayjs(date).isBefore(dayjs(), 'day');
};

export const validDate = date => {
	return (
		dayjs(date).isValid() &&
		!dayjs(date).isBefore(dayjs(), 'day') &&
		!dayjs(date).isAfter(dayjs(), 'day')
	);
};

export const validateEndDate = (endDate, startDate) => {
	if (!endDate || !startDate) return true;
	return !dayjs(endDate).isBefore(dayjs(startDate), 'day');
};
