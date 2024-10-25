import { getHealthCheck } from "../../utils/db-util";

export const healthCheck = async () => {
  return await getHealthCheck();
}