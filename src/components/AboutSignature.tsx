import React from 'react';
import { AboutCard } from './AboutCard';

interface AboutSignatureProps {
  id?: string;
}

export const AboutSignature: React.FC<AboutSignatureProps> = ({ id = 'bag-om-bloggen' }) => {
  return <AboutCard id={id} />;
};

export { AboutCard };
export default AboutSignature;

