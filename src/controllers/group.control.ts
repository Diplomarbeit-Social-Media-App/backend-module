import { OK } from 'http-status';
import catchAsync from '../utils/catchAsync';

export const postCreateGroup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(OK);
  },
);
