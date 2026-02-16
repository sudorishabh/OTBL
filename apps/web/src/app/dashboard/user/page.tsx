import Wrapper from "@/components/wrapper/Wrapper";
import UserPage from "./_components/UserPage";
import CreateUserButton from "./_components/CreateUserButton";

const page = () => {
  return (
    <Wrapper
      title='User Management'
      description='Manage users, assign them to offices, and track their work locations'
      button={<CreateUserButton />}>
      <UserPage />
    </Wrapper>
  );
};

export default page;
