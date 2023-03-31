import * as bcrypt from 'bcrypt'

export async function createPassword(password: string): Promise<string> {
  // console.log(bcrypt)
  const salt: string = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashed)
  } catch (e) {
    return false
  }
}