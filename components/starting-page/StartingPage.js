import React from "react";
import classes from "./StartingPage.module.css";

const StartingPageContent = () => {
  // Show Link to Login page if NOT auth

  return (
    <section className={classes.starting}>
      <h1>Welcome on Board!</h1>
    </section>
  );
};

export default StartingPageContent;
