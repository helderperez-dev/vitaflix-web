"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
    Mail, 
    Save, 
    Zap, 
    PlusCircle, 
    Upload, 
    Kanban, 
    Table,
    Loader2,
    CheckCircle2
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateSystemConfig } from "@/app/actions/settings"

interface IntegrationConfig {
    enabled: boolean;
    listId: number;
}

export interface BrevoConfig {
    landingPage: IntegrationConfig;
    addLead: IntegrationConfig;
    importCsv: IntegrationConfig;
    kanbanSync: IntegrationConfig;
    dataGridSync: IntegrationConfig;
}

interface BrevoSettingProps {
    initialConfig: BrevoConfig;
}

const DEFAULT_CONFIG: BrevoConfig = {
    landingPage: { enabled: true, listId: 2 },
    addLead: { enabled: true, listId: 2 },
    importCsv: { enabled: true, listId: 2 },
    kanbanSync: { enabled: true, listId: 2 },
    dataGridSync: { enabled: true, listId: 2 }
};

export function BrevoSetting({ initialConfig }: BrevoSettingProps) {
    const [config, setConfig] = React.useState<BrevoConfig>(initialConfig || DEFAULT_CONFIG);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleToggle = (key: keyof BrevoConfig) => {
        setConfig(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled }
        }));
    };

    const handleListIdChange = (key: keyof BrevoConfig, value: string) => {
        const numValue = parseInt(value) || 0;
        setConfig(prev => ({
            ...prev,
            [key]: { ...prev[key], listId: numValue }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateSystemConfig('brevo_config', config);
        setIsSaving(false);

        if (result.success) {
            toast.success("Brevo configuration updated successfully!");
        } else {
            toast.error("Failed to update Brevo configuration.");
        }
    };

    const IntegrationRow = ({ 
        icon: Icon, 
        title, 
        description, 
        configKey 
    }: { 
        icon: any; 
        title: string; 
        description: string; 
        configKey: keyof BrevoConfig 
    }) => (
        <div className="flex items-center justify-between p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-white/[0.02] hover:bg-white/80 dark:hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center gap-6">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Icon className="size-6" />
                </div>
                <div>
                    <h4 className="text-base font-bold text-foreground tracking-tight leading-none mb-2">{title}</h4>
                    <p className="text-xs font-medium text-muted-foreground/60">{description}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-8">
                <div className="flex flex-col gap-2 min-w-[120px]">
                    <Label htmlFor={`${configKey}-listId`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        List ID
                    </Label>
                    <Input 
                        id={`${configKey}-listId`}
                        type="number"
                        value={config[configKey].listId}
                        onChange={(e) => handleListIdChange(configKey, e.target.value)}
                        disabled={!config[configKey].enabled}
                        className="h-9 rounded-xl bg-background/50 border-border/20 text-xs font-bold w-24 focus-visible:ring-primary/20"
                    />
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Status
                    </Label>
                    <Switch 
                        checked={config[configKey].enabled}
                        onCheckedChange={() => handleToggle(configKey)}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-[2rem] overflow-hidden border shadow-none">
            <CardHeader className="p-10 border-b border-border/10 bg-gradient-to-br from-slate-50/50 to-white dark:from-white/[0.02] dark:to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Mail className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground dark:text-white">
                                Brevo Integration
                            </CardTitle>
                            <CardDescription className="text-[13px] font-medium text-muted-foreground/70 mt-1">
                                Configure how leads are synchronized with Brevo marketing lists.
                            </CardDescription>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="h-11 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-8 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-3"
                    >
                        {isSaving ? (
                            <><Loader2 className="size-4 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="size-4" /> Save Configuration</>
                        )}
                    </Button>
                </div>
            </CardHeader>
            
            <CardContent className="p-10 space-y-4">
                <IntegrationRow 
                    icon={Zap}
                    title="Landing Page"
                    description="Main page waiting list subscription process."
                    configKey="landingPage"
                />
                
                <IntegrationRow 
                    icon={PlusCircle}
                    title="Manual Add Lead"
                    description="When an admin clicks [+ Add Lead] in the dashboard."
                    configKey="addLead"
                />
                
                <IntegrationRow 
                    icon={Upload}
                    title="CSV Import"
                    description="Bulk lead creation via CSV file upload."
                    configKey="importCsv"
                />
                
                <IntegrationRow 
                    icon={Kanban}
                    title="Kanban Sync"
                    description="Manual sync option for individual lead cards."
                    configKey="kanbanSync"
                />
                
                <IntegrationRow 
                    icon={Table}
                    title="Data Grid Sync"
                    description="Bulk sync option in the leads table view."
                    configKey="dataGridSync"
                />
            </CardContent>
        </Card>
    );
}
