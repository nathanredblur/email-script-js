import scotiabank from './scotiabank.js';

export const parserConfigs = [
  {
    ...scotiabank,
    email: 'jon.nathan.rich@gmail.com',
  },
]

export const getParserConfig = (email) => {
  const parserConfig = parserConfigs.find((parserConfig) => {
    return parserConfig.email === email;
  });

  return parserConfig;
}

export default parserConfigs;