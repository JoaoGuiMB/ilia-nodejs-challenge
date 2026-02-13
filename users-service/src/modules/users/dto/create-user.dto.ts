import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly first_name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly last_name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  readonly password: string;
}
