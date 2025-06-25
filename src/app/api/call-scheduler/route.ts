import { NextRequest, NextResponse } from 'next/server';
import { 
  startCallScheduler, 
  processDueCallSchedules, 
  getActiveCallSchedules 
} from '@/lib/smart_call_scheduler';

// Global variable to store the scheduler interval
let schedulerInterval: NodeJS.Timeout | null = null;

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    switch (action) {
      case 'start':
        if (schedulerInterval) {
          clearInterval(schedulerInterval);
        }
        schedulerInterval = startCallScheduler();
        return NextResponse.json({ 
          message: 'Call scheduler started successfully',
          status: 'running'
        });

      case 'stop':
        if (schedulerInterval) {
          clearInterval(schedulerInterval);
          schedulerInterval = null;
        }
        return NextResponse.json({ 
          message: 'Call scheduler stopped',
          status: 'stopped'
        });

      case 'process':
        await processDueCallSchedules();
        return NextResponse.json({ 
          message: 'Processed due call schedules',
          status: 'processed'
        });

      default:
        return NextResponse.json({ 
          message: 'Invalid action. Use: start, stop, or process' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error managing call scheduler:', error);
    return NextResponse.json({ 
      message: `Failed to manage call scheduler: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const schedules = await getActiveCallSchedules();
    
    return NextResponse.json({
      success: true,
      schedulerStatus: schedulerInterval ? 'running' : 'stopped',
      totalSchedules: schedules.length,
      schedules: schedules.map(schedule => ({
        ...schedule,
        timeUntilDue: new Date(schedule.scheduledCallTime).getTime() - Date.now(),
        isDue: new Date(schedule.scheduledCallTime).getTime() <= Date.now()
      }))
    });
  } catch (error: any) {
    console.error('Error getting call schedules:', error);
    return NextResponse.json({ 
      message: `Failed to get call schedules: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}