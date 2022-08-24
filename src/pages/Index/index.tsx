import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

export default function Index() {
  const [email, setEmail] = useState('gavazzonimaicon@hotmail.com')
  const [password, setPassword] = useState('1234')

  const { signIn, isAuthenticated } = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const data = {
      email,
      password,
    }

    await signIn(data)
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  )
}
