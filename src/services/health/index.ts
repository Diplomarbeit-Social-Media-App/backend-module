import { getHealthCheck } from '../../utils/db';

export const healthCheck = async () => {
  return await getHealthCheck();
};
