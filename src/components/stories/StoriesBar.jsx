import { useTrips } from '../../context/TripsContext.jsx'
import { mockUsers } from '../../data/mockUsers.js'

export default function StoriesBar() {
  const { getFeedTrips } = useTrips()
  const trips = getFeedTrips()

  // Get unique active drivers
  const activeDrivers = []
  const seen = new Set()
  for (const trip of trips) {
    if (trip.driver && !seen.has(trip.driver.id) && trip.type === 'offer') {
      seen.add(trip.driver.id)
      activeDrivers.push(trip.driver)
    }
  }

  return (
    <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1">
      {activeDrivers.slice(0, 8).map((driver) => (
        <div key={driver.id} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="p-0.5 rounded-full story-ring">
            <div className="p-0.5 bg-white rounded-full">
              <img
                src={driver.avatar}
                alt={driver.name}
                className="w-14 h-14 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=6366f1&color=fff`
                }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-600 font-medium w-16 text-center truncate">
            {driver.firstName || driver.name.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  )
}
