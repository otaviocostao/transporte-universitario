import './Footer.css'

const Footer = () => {
  return (
    <div className='footer-area'>
      <p className='paragraph-footer'>
        ©{new Date().getFullYear()} - Transporte Universitário - Desenvolvido por Otavio Costa 
      </p>
    </div>
  )
}

export default Footer
