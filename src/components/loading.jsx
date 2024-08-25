import { TailSpin } from 'react-loader-spinner'

export default function Loading() {
  return (
    <div className={`overlay`}>
        <TailSpin
          visible={true}
          height="50"
          width="50"
          ariaLabel="tail-spin-loading"
          wrapperStyle={{}}
          wrapperClass="loader"
          color='#EDF2F4'
          secondaryColor='#EDF2F4'
          radius="1"
        />
      </div>
  )
}
