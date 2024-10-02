// Đối tượng 'Validator'
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    function validate(inputElement, rule) {
        var errorMessage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var rules = selectorRules[rule.selector];

        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    var checkedElement = formElement.querySelector(rule.selector + ':checked');
                    errorMessage = rules[i](checkedElement ? checkedElement.value : '');
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElements = formElement.querySelectorAll(rule.selector);
                Array.from(inputElements).forEach(function (inputElement) {
                    var isValid = validate(inputElement, rule);
                    if (!isValid) {
                        isFormValid = false;
                    }
                });
            });

            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value;
                                } else {
                                    if (!values[input.name]) values[input.name] = '';
                                }
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues); 
                } else {
                    formElement.submit();
                }
            }
        };

        options.rules.forEach(function (rule) {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                if (inputElement) {
                    inputElement.onblur = function () {
                        validate(inputElement, rule);
                    };

                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    };
                }
            });
        });
    }
}

// Định nghĩa các rules
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập dữ liệu cho trường này';
        }
    };
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Mật khẩu tối thiếu gồm ${min} kí tự`;
        }
    };
}

Validator.isConfirmed = function (selector, confirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === confirmValue() ? undefined : message || 'Giá trị nhập vào chưa chính xác';
        }
    };
}

// Sử dụng Validator
Validator({
    form: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    genderSelector: 'input[name="gender"]',
    rules: [
        Validator.isRequired('#fullname', 'Vui lòng nhập tên đầy đủ của bạn'),
        Validator.isRequired('#email', 'Vui lòng nhập thông tin email'),
        Validator.isRequired('#password_confirmation', 'Nhập lại mật khẩu chưa chính xác'),
        Validator.isRequired('#province', 'Vui lòng chọn tỉnh thành của bạn'),
        Validator.isRequired('input[name="gender"]', 'Vui lòng chọn giới tính của bạn'),
        Validator.isEmail('#email'),
        Validator.minLength('#password', 6),
        Validator.isConfirmed('#password_confirmation', function () {
            return document.querySelector('#form-1 #password').value;
        }, 'Mật khẩu nhập lại không chính xác'),
    ],
    onSubmit: function (data) {
        // Call API or xử lý dữ liệu form
        console.log(data); 
    }
});

// Validator({
//     form: '#form-2',
//     formGroupSelector: '.form-group',
//     errorSelector: '.form-message',
//     rules: [
//         Validator.isEmail('#email'),
//         Validator.minLength('#password', 6),
//     ],
//     onSubmit: function (data) {
//         // Call API
//         console.log(data);
//     }
// });