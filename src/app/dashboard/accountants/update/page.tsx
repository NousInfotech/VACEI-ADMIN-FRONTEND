import UserForm from "../components/Form";
import Breadcrumb from "@/components/Breadcrumb";
export default function UpdateAccountant() {
    return (
        <section className="mx-auto lg:max-w-[1400px] max-w-lvw px-[15px] w-full pt-8">
            <Breadcrumb />
            <div className="bg-white shadow p-6 mt-5">
                <UserForm />
            </div>
        </section>
    );
}