import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, Play, TestTube2, Settings } from "lucide-react";
import DetailsModal from "./Modal";
import WorkflowJSON from "./WorkflowJSON";
import { intervalUnits, scheduleTypes, timezones } from "@/constants/edges";

export default function ScheduleDetails({ setSelectedNode }) {
  const [scheduleType, setScheduleType] = useState("interval");
  const [intervalValue, setIntervalValue] = useState("5");
  const [intervalUnit, setIntervalUnit] = useState("minutes");
  const [cronExpression, setCronExpression] = useState("0 0 * * *");
  const [specificTime, setSpecificTime] = useState("09:00");
  const [specificDate, setSpecificDate] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [scheduleStatus, setScheduleStatus] = useState("active");

  const getNextRunTime = () => {
    const now = new Date();
    let nextRun = new Date(now);

    switch (scheduleType) {
      case "interval":
        const minutes =
          intervalUnit === "minutes"
            ? parseInt(intervalValue)
            : intervalUnit === "hours"
            ? parseInt(intervalValue) * 60
            : parseInt(intervalValue) * 24 * 60;
        nextRun.setMinutes(nextRun.getMinutes() + minutes);
        break;
      case "daily":
        const [hours, mins] = specificTime.split(":");
        nextRun.setHours(parseInt(hours), parseInt(mins), 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case "once":
        if (specificDate) {
          const [datePart, timePart = specificTime] = specificDate.includes("T")
            ? specificDate.split("T")
            : [specificDate, specificTime];
          nextRun = new Date(`${datePart}T${timePart}`);
        }
        break;
      default:
        return "Based on cron expression";
    }

    return nextRun.toLocaleString();
  };

  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON data={null} type="input" />
      <ScrollArea
        className="w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule Configuration
              </CardTitle>
              <Badge
                variant={scheduleStatus === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {scheduleStatus === "active" ? "Active" : "Paused"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Schedule Type Section */}
            <div className="space-y-2">
              <Label htmlFor="schedule-type" className="text-sm font-medium">
                Schedule Type
              </Label>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger id="schedule-type" className="w-full">
                  <SelectValue placeholder="Select schedule type" />
                </SelectTrigger>
                <SelectContent>
                  {scheduleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col items-start">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {type.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Interval Settings */}
            {scheduleType === "interval" && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Interval Settings</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={intervalValue}
                    onChange={(e) => setIntervalValue(e.target.value)}
                    placeholder="5"
                    className="w-20"
                    min="1"
                  />
                  <Select value={intervalUnit} onValueChange={setIntervalUnit}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {intervalUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground">
                  Runs every {intervalValue} {intervalUnit}
                </div>
              </div>
            )}

            {/* Cron Expression */}
            {scheduleType === "cron" && (
              <div className="space-y-2">
                <Label htmlFor="cron" className="text-sm font-medium">
                  Cron Expression
                </Label>
                <Input
                  id="cron"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="0 0 * * *"
                  className="font-mono text-sm"
                />
                <div className="text-xs text-muted-foreground">
                  Format: minute hour day month day-of-week
                </div>
              </div>
            )}

            {/* Daily/Weekly/Monthly Time */}
            {(scheduleType === "daily" ||
              scheduleType === "weekly" ||
              scheduleType === "monthly") && (
              <div className="space-y-2">
                <Label htmlFor="specific-time" className="text-sm font-medium">
                  Time
                </Label>
                <Input
                  id="specific-time"
                  type="time"
                  value={specificTime}
                  onChange={(e) => setSpecificTime(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {/* One Time Date/Time */}
            {scheduleType === "once" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="specific-date"
                    className="text-sm font-medium"
                  >
                    Date & Time
                  </Label>
                  <Input
                    id="specific-date"
                    type="datetime-local"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Timezone Section */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-medium">
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Next Run Preview */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Next Run</span>
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {getNextRunTime()}
              </div>
            </div>

            {/* Schedule Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                <span className="text-sm font-medium">Schedule Status</span>
              </div>
              <Button
                variant={scheduleStatus === "active" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setScheduleStatus(
                    scheduleStatus === "active" ? "paused" : "active"
                  )
                }
              >
                {scheduleStatus === "active" ? "Active" : "Paused"}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" size="sm">
                Save Schedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <TestTube2 className="h-3 w-3" />
                Test Run
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
      <WorkflowJSON data={null} type="output" />
    </DetailsModal>
  );
}
