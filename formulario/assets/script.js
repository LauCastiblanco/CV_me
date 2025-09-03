document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (!form) {
    console.warn('No encontré #registerForm. ¿La ruta del <script> es correcta?');
    return;
  }

  const inputs = form.querySelectorAll('input[required], input[name="telefono"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const successMsg = document.getElementById('successMsg');

  // Estado reCAPTCHA y span de error
  let captchaOK = false;
  const captchaError = document.getElementById('captchaError');

  // Reglas
  const regex = {
    nombre: /^[a-záéíóúñ\s]{3,}$/i,
    email: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|co|org|net|edu)$/i,
    // MÍNIMO 10, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/,
    celular: /^3\d{9}$/,      // 10 dígitos y empieza por 3
    telefono: /^\d{10,}$/     // OPCIONAL, pero si se escribe => mínimo 10 dígitos
  };

  function setInvalid(input, msg) {
    const errorSpan = input.nextElementSibling;
    input.classList.add('invalid');
    if (errorSpan) errorSpan.textContent = msg || '';
  }
  function setValid(input) {
    const errorSpan = input.nextElementSibling;
    input.classList.remove('invalid');
    if (errorSpan) errorSpan.textContent = '';
  }

  function validateField(input) {
    const name = input.name;
    const value = (input.value || '').trim();

    switch (name) {
      case 'nombre':
        if (!regex.nombre.test(value)) return setInvalid(input, 'Mínimo 3 letras, solo texto'), false;
        return setValid(input), true;

      case 'email':
        if (!regex.email.test(value)) return setInvalid(input, 'Correo inválido (ej: ejemplo@dominio.com)'), false;
        return setValid(input), true;

      case 'password':
        if (!regex.password.test(value)) {
          return setInvalid(input, 'Mín. 10, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo'), false;
        }
        // si cambia password, revalida confirm
        const confirm = form.querySelector('input[name="confirmPassword"]');
        if (confirm && confirm.value) validateField(confirm);
        return setValid(input), true;

      case 'confirmPassword':
        if (value !== form.password.value || !value) {
          return setInvalid(input, 'Las contraseñas no coinciden'), false;
        }
        return setValid(input), true;

      case 'nacimiento': {
        const birth = new Date(value);
        if (isNaN(birth.getTime())) return setInvalid(input, 'Fecha inválida'), false;
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age < 18) return setInvalid(input, 'Debes tener al menos 18 años'), false;
        return setValid(input), true;
      }

      case 'celular':
        if (!regex.celular.test(value)) return setInvalid(input, 'Ej: 3051234567 (10 dígitos, inicia en 3)'), false;
        return setValid(input), true;

      case 'telefono':
        if (value && !regex.telefono.test(value)) return setInvalid(input, 'Si lo escribes, mínimo 10 dígitos'), false;
        return setValid(input), true;

      case 'terminos':
        if (!input.checked) {
          // el <span class="error"> está DESPUÉS del label o del input según tu HTML
          const err = (input.closest('label')?.nextElementSibling) || input.nextElementSibling;
          input.classList.add('invalid');
          if (err && err.classList.contains('error')) err.textContent = 'Debes aceptar los términos';
          return false;
        } else {
          const err = (input.closest('label')?.nextElementSibling) || input.nextElementSibling;
          input.classList.remove('invalid');
          if (err && err.classList.contains('error')) err.textContent = '';
          return true;
        }
    }
    // Campos no contemplados explícitamente
    return true;
  }

  function updateSubmitState() {
    const fieldsOK = [...inputs].every(i => validateField(i));
    submitBtn.disabled = !(fieldsOK && captchaOK);
  }

  // Eventos de los campos (input y change)
  inputs.forEach(input => {
    input.addEventListener('input', () => { validateField(input); updateSubmitState(); });
    input.addEventListener('change', () => { validateField(input); updateSubmitState(); });
  });

  // Callbacks globales del reCAPTCHA v2 (HTML los invoca)
  window.onReCaptchaSuccess = function () {
    captchaOK = true;
    if (captchaError) captchaError.textContent = '';
    updateSubmitState();
  };
  window.onReCaptchaExpired = function () {
    captchaOK = false;
    if (captchaError) captchaError.textContent = 'Por favor, resuelve el reCAPTCHA';
    updateSubmitState();
  };

  // Envío (solo frontend de demostración)
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fieldsOK = [...inputs].every(i => validateField(i));
    const token = (window.grecaptcha && grecaptcha.getResponse) ? grecaptcha.getResponse() : '';
    if (!(fieldsOK && token)) {
      if (!token && captchaError) captchaError.textContent = 'Por favor, marca el reCAPTCHA';
      updateSubmitState();
      return;
    }
    // Éxito visual
    form.classList.add('hidden');
    if (successMsg) successMsg.classList.remove('hidden');
    setTimeout(() => {
      form.reset();
      inputs.forEach(i => i.classList.remove('invalid'));
      if (window.grecaptcha) grecaptcha.reset();
      captchaOK = false;
      updateSubmitState();
      if (successMsg) successMsg.classList.add('hidden');
      form.classList.remove('hidden');
    }, 2500);
  });

  // Estado inicial
  updateSubmitState();
});
