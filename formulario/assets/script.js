const form = document.getElementById('registerForm');
const inputs = form.querySelectorAll('input[required], input[name="telefono"]');
const submitBtn = form.querySelector('button[type="submit"]');
const successMsg = document.getElementById('successMsg');

// Expresiones regulares
const regex = {
  nombre: /^[a-záéíóúñ\s]{3,}$/i,
  email: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|co|org|net|edu)$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/,
  celular: /^3\d{9}$/,
  telefono: /^\d{7,10}$/
};

// Validar UN solo campo
function validateField(input) {
  const name = input.name;
  const value = input.value.trim();
  const errorSpan = input.nextElementSibling;

  let valid = true;
  let message = '';

  switch (name) {
    case 'nombre':
      if (!regex.nombre.test(value)) {
        valid = false;
        message = 'Mínimo 3 letras, solo texto';
      }
      break;

    case 'email':
      if (!regex.email.test(value)) {
        valid = false;
        message = 'Correo inválido (ej: ejemplo@dominio.com)';
      }
      break;

    case 'password':
      if (!regex.password.test(value)) {
        valid = false;
        message = '10 carácteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo';
      }
      break;

    case 'confirmPassword':
      if (value !== form.password.value) {
        valid = false;
        message = 'Las contraseñas no coinciden';
      }
      break;

    case 'nacimiento': {
      const birth = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      const d = today.getDate() - birth.getDate();
      const realAge = m < 0 || (m === 0 && d < 0) ? age - 1 : age;
      if (realAge < 18 || realAge > 100) {
        valid = false;
        message = 'Debes tener mas de 18 años ';
      }
      break;
    }

    case 'celular':
      if (!regex.celular.test(value)) {
        valid = false;
        message = 'Debe ser un número colombiano (ej: 3101234567)';
      }
      break;

    case 'telefono':
      if (value && !regex.telefono.test(value)) {
        valid = false;
        message = '7 o 10 dígitos numéricos';
      }
      break;

    case 'terminos':
      if (!input.checked) {
        valid = false;
        message = 'Debes aceptar los términos';
      }
      break;
  }

  // MOSTRAR / OCULTAR mensaje de error
  errorSpan.textContent = message;
  input.classList.toggle('invalid', !valid);

  return valid;
}

// Escuchar cada campo INDIVIDUALMENTE
inputs.forEach(input => {
  input.addEventListener('input', () => {
    validateField(input); // valida solo este campo
    const allValid = [...inputs].every(i => validateField(i)); // revisa estado global
    submitBtn.disabled = !allValid;
  });
});

// Al enviar (evita recargar y muestra éxito)
form.addEventListener('submit', e => {
  e.preventDefault();
  if ([...inputs].every(validateField)) {
    form.classList.add('hidden');
    successMsg.classList.remove('hidden');
    setTimeout(() => {
      form.reset();
      form.classList.remove('hidden');
      successMsg.classList.add('hidden');
    }, 3000);
  }
});