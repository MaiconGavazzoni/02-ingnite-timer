import { HeaderContainer } from './styles'
import { Timer, Scroll, SignOut } from 'phosphor-react'
import logoIgnite from '../../assets/logo-ignite.svg'
import { Link, NavLink } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
export function Header() {
  const { signOut } = useContext(AuthContext)

  return (
    <HeaderContainer>
      <img src={logoIgnite} alt="" />
      <nav>
        <NavLink to="/home" title="Timer">
          <Timer size={24} />
        </NavLink>
        <NavLink to="/history" title="Histórico">
          <Scroll size={24} />
        </NavLink>
        <button type="button" onClick={() => signOut()}>
          <SignOut size={24} />
        </button>
      </nav>
    </HeaderContainer>
  )
}
