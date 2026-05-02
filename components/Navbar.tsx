import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Anchor, Zap, ShieldCheck } from 'lucide-react'

interface NavbarProps {
  voice: 'Professional' | 'Executive';
  setVoice: (voice: 'Professional' | 'Executive') => void;
}

const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Property Canvas', href: '#', current: false }, // Hinting at Shadow + Slate
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar({ voice, setVoice }: NavbarProps) {
  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center gap-2">
              <Anchor className="text-blue-400 size-6" />
              <span className="text-white font-black tracking-tighter text-xl">LIGHTHOUSE</span>
            </div>

            <div className="flex bg-slate-800/50 p-1 rounded-full border border-white/10 shadow-inner">
              <button
                onClick={() => setVoice('Professional')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${voice === 'Professional' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Zap size={14} className={voice === 'Professional' ? 'text-blue-200' : 'text-slate-500'} />
                Ivy Aria
              </button>
              <button
                onClick={() => setVoice('Executive')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${voice === 'Executive' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <ShieldCheck size={14} className={voice === 'Executive' ? 'text-slate-200' : 'text-slate-500'} />
                Ryan Alexander
              </button>
            </div>

            <div className="hidden sm:ml-10 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-bold transition-all',
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button
              type="button"
              className="relative rounded-full p-1 text-slate-400 hover:text-white focus:outline-none"
            >
              <BellIcon aria-hidden="true" className="size-6" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full bg-slate-800 outline outline-offset-1 outline-white/10">
                <span className="sr-only">Open user menu</span>
                <img
                  alt="Lindsey Howard"
                  src="https://ui-avatars.com/api/?name=Lindsey+Howard&background=2563eb&color=fff"
                  className="size-8 rounded-full"
                />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-slate-900 border border-white/10 py-1 shadow-2xl transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <MenuItem>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Your Profile</a>
                </MenuItem>
                <MenuItem>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Settings</a>
                </MenuItem>
                <div className="h-px bg-white/10 my-1" />
                <MenuItem>
                  <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Sign out</a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3 bg-slate-900 border-b border-white/10">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={classNames(
                item.current ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}