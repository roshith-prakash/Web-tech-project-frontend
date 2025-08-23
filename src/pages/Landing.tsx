import { PrimaryButton, SecondaryButton } from "@/components";

const Landing = () => {
  return (
    <div>
      <PrimaryButton text="Hello" onClick={() => alert("Clicked")} />
      <SecondaryButton text="Hello" onClick={() => alert("Clicked")} />
    </div>
  );
};

export default Landing;
