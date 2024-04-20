import WhyChooseImage from "../../../public/images/WhyChooseImage.png";
import React from 'react';
import { Grid } from '@material-ui/core';
import FeatureList from './components/featureList/FeatureList';
import './WhyChoose.css';
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";

const WhyChoose = () => {

  return (
    <>
    {/* <Navbar /> */}
    <div className="body" style={{padding: "15px"}}>
      <Grid container>
      <Grid item xs={12} md={12} lg={5}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <img
          src={WhyChooseImage}
          alt="Illustration"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
        </Grid>

        <Grid item xs={12} md={12} lg={6}>
          <h3>
            Why Choose Deen School
          </h3>
          <p>
           At Deen School we try to impart Islamic, Scientific, Technological, Social & Physical education to Muslims in order to help us live our lives according to Islamic principles; eliminate the scientific & technological regression that we are facing since the culmination of our golden age; enhance our physical & mental health & to counteract liberal, secular, atheistic & other anti-Islamic philosophies.
          </p>
          <h3>
            Core Features
          </h3>
          <p>
            Deen School provides some great features for imparting necessary principles in order to live our lives as per Islamic principles. Clear and accountable education to eliminate the regression we are facing in Scientific world. We guarantee you an exceptional experience.
          </p>
          <FeatureList />
        </Grid>
      </Grid>
      <Footer />
    </div>
    </>
  );
};

export default WhyChoose;