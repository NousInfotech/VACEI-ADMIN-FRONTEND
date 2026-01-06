import UserForm from "../components/Form";
import Breadcrumb from "@/components/Breadcrumb";
export default function CrateAccountant() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5">
      <Breadcrumb />
      <div className="bg-white border border-gray-200 rounded-[10px] px-5 py-6 overflow-hidden">
        <UserForm />
      </div>
    </section>
  );
}