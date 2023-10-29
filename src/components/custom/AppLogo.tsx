import Image from 'next/image'

function AppLogo ({ className }: { className: string }) {
  return (
    <Image
      src='https://cdn-icons-png.flaticon.com/512/8943/8943377.png'
      alt='logo'
      height={100}
      width={200}
      className={className}
    />
  )
}

export default AppLogo
