import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + SECRET_KEY).toString()
}
