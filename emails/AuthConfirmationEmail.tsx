import * as React from "react";
import { BaseEmailLayout } from "@/emails/BaseEmailLayout";
import { Heading, Text, Section, Button, Link } from "@react-email/components";

const CONFIRMATION_URL_PLACEHOLDER = "{{ .ConfirmationURL }}";

export const AuthConfirmationEmail = () => {
  return (
    <BaseEmailLayout previewText={""}>
      <Heading className="text-2xl font-bold text-gray-800 my-6 ">
        Confirm Your Signup
      </Heading>

      <Text className="text-base text-gray-700 mb-6 ">
        Welcome to GetHired! Follow the link below to verify your email address
        and activate your account.
      </Text>

      <Section className=" my-8 ">
        <Button
          href={CONFIRMATION_URL_PLACEHOLDER}
          className="bg-black text-white py-3 px-6 rounded-md text-lg font-bold no-underline"
          style={{ backgroundColor: "#000000", color: "#FFFFFF" }}
        >
          Confirm Your Mail
        </Button>
      </Section>

      <Text className=" text-sm text-gray-500 mt-6 ">
        If the button above does not work, copy and paste this link into your
        browser:
        <br />
        <Link
          href={CONFIRMATION_URL_PLACEHOLDER}
          className="text-blue-600 underline break-all"
        >
          {CONFIRMATION_URL_PLACEHOLDER}
        </Link>
      </Text>

      <Text className="text-base text-gray-700 mt-10 ">
        Best regards,
        <br />
        The GetHired Team
      </Text>
    </BaseEmailLayout>
  );
};

export default AuthConfirmationEmail;
