"use client"
import { formatAmount } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
// import { Toggle } from '../ui/toggle'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

const BankCard = ({ account, userName }: CreditCardProps) => {
  const [showBalance, setShowBalance] = React.useState(false)

  const toggleBalance = () => setShowBalance(!showBalance)

  return (
    <div className="flex flex-col">
      <Link href="/" className="bank-card">
        <div className="bank-card_content">
          <div>
            <h1 className="text-16 font-semibold text-white">
              {account.name || userName}
            </h1>
            <p className="font-ibm-plex-serif font-black text-white">
              {/* <Toggle onClick={() => setShowBalance(!showBalance)}> */}
                {!showBalance ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />}
              {/* </Toggle> */}
              <span className={` ${!  showBalance ? 'blur-sm' : 'text-sm'}`}>
                {formatAmount(account.currentBalance)}
              </span>
            </p>
          </div>

          <article className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">
                {userName}
              </h1>
              <h2 className="text-12 font-semibold text-white">
              ●● / ●●
              </h2>
            </div>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16">1234</span>
            </p>
          </article>
        </div>

        <div className="bank-card_icon">
          <Image 
            src="/icons/Paypass.svg"
            width={20}
            height={24}
            alt="pay"
          />
          <Image 
            src="/icons/mastercard.svg"
            width={45}
            height={32}
            alt="mastercard"
            className="ml-5"
          />
        </div>

        <Image 
          src="/icons/lines.png"
          width={316}
          height={190}
          alt="lines"
          className="absolute top-0 left-0"
        />
      </Link>

      {/* COPY */}
    </div>
  )
}

export default BankCard