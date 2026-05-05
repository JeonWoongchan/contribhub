import { REPORT_EMAIL } from '@/constants/app'

export function HelpReportFooter() {
    return (
        <p>
            문제나 버그를 발견하셨나요?{' '}
            <a
                href={`mailto:${REPORT_EMAIL}`}
                className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
                {REPORT_EMAIL}
            </a>
            으로 제보해 주세요.
        </p>
    )
}
