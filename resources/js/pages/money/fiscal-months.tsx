import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

export default function FiscalMonths() {
    return (
        <>
            <Head title="Bulan Fiskal" />

            <div className="px-4 py-6">
                <Heading variant="small" title="Bulan Fiskal" description="Kelola periode penutupan bulan fiskal" />

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-base">Kelola Bulan Fiskal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Close a month to lock all transactions and snapshot account balances. Reopen to allow modifications.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Use the Dashboard to close or reopen the current month.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

FiscalMonths.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Bulan Fiskal', href: '/money/fiscal-months' },
    ],
};
