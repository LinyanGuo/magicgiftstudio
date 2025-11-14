export default function Contact() {
  return (
    <section className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-semibold">Contact & Pickup</h1>
      <p className="mt-3" style={{color:"#555"}}>Message us on Facebook to arrange your local pickup in Waterloo, ON.</p>
      <div className="mt-6 flex flex-col items-center gap-4">
        <img src="/qrcode-facebook.png" alt="Facebook QR" width={200} height={200} className="rounded-xl" />
        <a className="underline" href="https://facebook.com/magicgiftstudio" target="_blank" rel="noopener">facebook.com/magicgiftstudio</a>
        <p className="text-sm" style={{color:"#666"}}>Email: magicgiftstudio [at] outlook [dot] com</p>
      </div>
    </section>
  );
}
