export default function Footer(){

  return (
    <>
    
    <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2023 Alan Martins | <a href="https://alaresinternet.com.br/" className="hover:underline">Alares Internet</a>
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <li>
                <a href="https://alaresinternet.com.br/sobre-a-alares/" className="mr-4 hover:underline md:mr-6 ">Conheça a Alares</a>
            </li>
            <li>
                <a href="https://alaresinternet.com.br/politica-de-privacidade-e-cookies/" className="mr-4 hover:underline md:mr-6">Política de Privacidade</a>
            </li>
            <li>
                <a href="https://alares.atlassian.net/servicedesk/customer/portal/2" className="hover:underline">Portal</a>
            </li>
        </ul>
        </div>
    </footer>

    
    </>
  )
}