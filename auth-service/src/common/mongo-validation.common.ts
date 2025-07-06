import { BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export const assertValidMongoId = (id: string) =>
  isValidObjectId(id) || raiseBadRequest();

const raiseBadRequest = () => {
  throw new BadRequestException('El ID proporcionado no es válido');
};
