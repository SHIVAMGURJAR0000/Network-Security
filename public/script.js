const sidebar = document.getElementById("sidebar");

sidebar.addEventListener("mouseenter", () => {
  gsap.to(".sidebar", { width: "200px", duration: 0.2 });
  gsap.to(".main-content", { marginLeft: "200px", duration: 0.2 });
  
  
  gsap.to(".item-text", { display: "inline-block", opacity: 1, delay: 0.2 });
  gsap.to(".text", { display: "inline-block", opacity: 1, duration: 0.5, delay: 0.3 });
});

sidebar.addEventListener("mouseleave", () => {
  gsap.to(".sidebar", { width: "80px", duration: 0.3 });
  gsap.to(".main-content", { marginLeft: "80px", duration: 0.3 });

 
  gsap.to(".item-text", { opacity: 0, duration: 0.2, onComplete: () => {
    gsap.set(".item-text", { display: "none" });
  }});

  gsap.to(".text", { opacity: 0, duration: 0.2, onComplete: () => {
    gsap.set(".text", { display: "none" });
  }});
});
