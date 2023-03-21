const firebaseConfig = {
  apiKey: "AIzaSyA7AvoY8KgIrQzAevXIyELRlBY04fTO3IM",
  authDomain: "personalwebsite-cb1ab.firebaseapp.com",
  projectId: "personalwebsite-cb1ab",
  storageBucket: "personalwebsite-cb1ab.appspot.com",
  messagingSenderId: "430148707697",
  appId: "1:430148707697:web:df9a40be9c4018d12ac2d0",
  measurementId: "G-6MVXQDC1B5",
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

const contactForm = document.querySelector("#contactForm");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  db.collection("contactSubmissions").add({
    name: contactForm.inputName.value,
    email: contactForm.inputEmail.value,
    message: contactForm.inputMessage.value,
  });
  contactForm.reset();
  alert("Thank you for your message!");
});
